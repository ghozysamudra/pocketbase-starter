<script lang="ts">
  import { pb } from "$lib/pocketbase.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { goto } from "$app/navigation";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";
  import {
    User,
    Mail,
    Lock,
    RefreshCw,
    Check,
    AlertCircle,
    Upload,
  } from "@lucide/svelte";

  // Check auth status
  let currentUser = $state(pb.authStore.isValid ? pb.authStore.record : null);

  pb.authStore.onChange((token, model) => {
    currentUser = pb.authStore.isValid ? model : null;
    if (!currentUser) {
      goto("/login");
    }
  });

  $effect(() => {
    if (!currentUser) {
      goto("/login");
    }
  });

  function handleLogout() {
    pb.authStore.clear();
  }

  // Profile Form State
  let nameInput = $state("");
  let avatarFile = $state<File | null>(null);
  let avatarPreview = $state("");
  let isUpdatingProfile = $state(false);
  let profileMessage = $state("");
  let profileSuccess = $state(false);

  // Sync profile details on load or user change
  $effect(() => {
    if (currentUser) {
      nameInput = currentUser.name || "";
      avatarPreview = currentUser.avatar
        ? pb.files.getUrl(currentUser, currentUser.avatar)
        : "";
    }
  });

  function handleAvatarChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      avatarFile = target.files[0];
      avatarPreview = URL.createObjectURL(avatarFile);
    }
  }

  async function updateProfile(e: SubmitEvent) {
    e.preventDefault();
    if (!currentUser) return;
    isUpdatingProfile = true;
    profileMessage = "";
    profileSuccess = false;

    try {
      const formData = new FormData();
      formData.append("name", nameInput);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await pb.collection("users").update(currentUser.id, formData);
      await pb.collection("users").authRefresh();
      profileMessage = "Profile updated successfully!";
      profileSuccess = true;
      avatarFile = null; // Reset file input state

      setTimeout(() => {
        profileMessage = "";
      }, 3000);
    } catch (error: any) {
      console.error("Update profile error:", error);
      profileMessage = error?.message || "Failed to update profile.";
      profileSuccess = false;
    } finally {
      isUpdatingProfile = false;
    }
  }

  // Email Form State
  let newEmail = $state("");
  let isUpdatingEmail = $state(false);
  let emailMessage = $state("");
  let emailSuccess = $state(false);

  async function updateEmail(e: SubmitEvent) {
    e.preventDefault();
    if (!currentUser) return;
    isUpdatingEmail = true;
    emailMessage = "";
    emailSuccess = false;

    try {
      await pb.collection("users").requestEmailChange(newEmail);
      emailMessage =
        "Verification email sent. Please check both your current and new inboxes to confirm the change.";
      emailSuccess = true;
      newEmail = "";
    } catch (error: any) {
      console.error("Email update error:", error);
      // PocketBase errors often have a detailed response body
      const detail = error?.response?.message || error?.message;
      emailMessage = detail || "Failed to request email change. Please ensure your mail server is configured.";
      emailSuccess = false;
    } finally {
      isUpdatingEmail = false;
    }
  }

  // Password Form State
  let oldPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  let isUpdatingPassword = $state(false);
  let passwordMessage = $state("");
  let passwordSuccess = $state(false);

  async function updatePassword(e: SubmitEvent) {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword !== confirmPassword) {
      passwordMessage = "New passwords do not match.";
      passwordSuccess = false;
      return;
    }

    isUpdatingPassword = true;
    passwordMessage = "";
    passwordSuccess = false;

    try {
      await pb.collection("users").update(currentUser.id, {
        oldPassword,
        password: newPassword,
        passwordConfirm: confirmPassword,
      });
      passwordMessage = "Password updated successfully!";
      passwordSuccess = true;
      oldPassword = "";
      newPassword = "";
      confirmPassword = "";

      setTimeout(() => {
        passwordMessage = "";
      }, 3000);
    } catch (error: any) {
      console.error("Password update error:", error);
      passwordMessage =
        error?.message ||
        "Failed to update password. Please check your current password.";
      passwordSuccess = false;
    } finally {
      isUpdatingPassword = false;
    }
  }
</script>

<svelte:head>
  <title>Account Settings - PocketBase Console</title>
</svelte:head>

{#if currentUser}
  <Sidebar.Provider>
    <AppSidebar
      user={{
        name: currentUser.name || currentUser.username || "User",
        email: currentUser.email,
        avatar: currentUser.avatar
          ? pb.files.getUrl(currentUser, currentUser.avatar)
          : `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.email}`,
      }}
      onlogout={handleLogout}
    />
    <Sidebar.Inset>
      <!-- Top Header -->
      <header
        class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-6 bg-card/20 backdrop-blur-sm sticky top-0 z-10"
      >
        <div class="flex items-center gap-2">
          <Sidebar.Trigger class="-ms-1" />
          <Separator
            orientation="vertical"
            class="me-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb.Root>
            <Breadcrumb.List>
              <Breadcrumb.Item class="hidden md:block">
                <Breadcrumb.Link href="/dashboard">Dashboard</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator class="hidden md:block" />
              <Breadcrumb.Item>
                <Breadcrumb.Page>Account Settings</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>
        <div class="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex flex-1 flex-col gap-6 p-6 max-w-4xl w-full mx-auto">
        <div class="space-y-1">
          <h1 class="text-3xl font-bold tracking-tight text-foreground">
            Account Settings
          </h1>
          <p class="text-sm text-muted-foreground">
            Manage your personal profile, email address, and security settings.
          </p>
        </div>

        <div class="grid gap-6">
          <!-- Card 1: Profile Details & Avatar -->
          <Card.Root
            class="border-border/40 bg-card/60 backdrop-blur-md shadow-sm"
          >
            <Card.Header>
              <Card.Title class="text-lg font-semibold flex items-center gap-2">
                <User class="h-5 w-5 text-primary" />
                Personal Profile
              </Card.Title>
              <Card.Description>
                Update your display name and profile picture.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <form onsubmit={updateProfile} class="space-y-6">
                {#if profileMessage}
                  <div
                    class="flex items-center gap-2 p-3 rounded-lg text-sm border {profileSuccess
                      ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-destructive/15 border-destructive/20 text-destructive'}"
                  >
                    {#if profileSuccess}
                      <Check class="h-4 w-4 shrink-0" />
                    {:else}
                      <AlertCircle class="h-4 w-4 shrink-0" />
                    {/if}
                    <p>{profileMessage}</p>
                  </div>
                {/if}

                <!-- Avatar Section -->
                <div
                  class="flex flex-col sm:flex-row items-start sm:items-center gap-6"
                >
                  <div class="relative">
                    <Avatar.Root class="size-24 border border-border">
                      <Avatar.Image
                        src={avatarPreview}
                        alt={currentUser.name || "Avatar"}
                        class="object-cover"
                      />
                      <Avatar.Fallback class="text-lg font-bold">
                        {(currentUser.name || currentUser.username || "U")
                          .substring(0, 2)
                          .toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </div>

                  <div class="space-y-2">
                    <Label for="avatar-upload" class="cursor-pointer">
                      <div
                        class="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                      >
                        <Upload class="h-4 w-4" />
                        Choose Photo
                      </div>
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      onchange={handleAvatarChange}
                      disabled={isUpdatingProfile}
                    />
                    <p class="text-xs text-muted-foreground">
                      PNG, JPG, or GIF up to 5MB.
                    </p>
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label for="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="e.g. John Doe"
                    bind:value={nameInput}
                    disabled={isUpdatingProfile}
                    class="max-w-md"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  class="gap-2"
                >
                  {#if isUpdatingProfile}
                    <RefreshCw class="h-4 w-4 animate-spin" />
                    Saving...
                  {:else}
                    Save Profile
                  {/if}
                </Button>
              </form>
            </Card.Content>
          </Card.Root>

          <!-- Card 2: Email Change -->
          <Card.Root
            class="border-border/40 bg-card/60 backdrop-blur-md shadow-sm"
          >
            <Card.Header>
              <Card.Title class="text-lg font-semibold flex items-center gap-2">
                <Mail class="h-5 w-5 text-primary" />
                Change Email Address
              </Card.Title>
              <Card.Description>
                Request a change to your email address. You will need to verify
                the new email address.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <form onsubmit={updateEmail} class="space-y-4">
                {#if emailMessage}
                  <div
                    class="flex items-center gap-2 p-3 rounded-lg text-sm border {emailSuccess
                      ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-destructive/15 border-destructive/20 text-destructive'}"
                  >
                    {#if emailSuccess}
                      <Check class="h-4 w-4 shrink-0" />
                    {:else}
                      <AlertCircle class="h-4 w-4 shrink-0" />
                    {/if}
                    <p>{emailMessage}</p>
                  </div>
                {/if}

                <div class="grid gap-1.5">
                  <span class="text-xs text-muted-foreground font-medium"
                    >Current Email</span
                  >
                  <span
                    class="text-sm font-mono text-foreground bg-muted/30 px-3 py-1.5 rounded border border-border/55 max-w-md"
                  >
                    {currentUser.email}
                  </span>
                </div>

                <div class="grid gap-2">
                  <Label for="newEmail">New Email Address</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="new-email@example.com"
                    bind:value={newEmail}
                    disabled={isUpdatingEmail}
                    class="max-w-md"
                    required
                  />
                </div>

                <Button type="submit" disabled={isUpdatingEmail} class="gap-2">
                  {#if isUpdatingEmail}
                    <RefreshCw class="h-4 w-4 animate-spin" />
                    Sending Request...
                  {:else}
                    Request Email Change
                  {/if}
                </Button>
              </form>
            </Card.Content>
          </Card.Root>

          <!-- Card 3: Change Password -->
          <Card.Root
            class="border-border/40 bg-card/60 backdrop-blur-md shadow-sm"
          >
            <Card.Header>
              <Card.Title class="text-lg font-semibold flex items-center gap-2">
                <Lock class="h-5 w-5 text-primary" />
                Change Password
              </Card.Title>
              <Card.Description>
                Ensure your account is secure by using a strong password.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <form onsubmit={updatePassword} class="space-y-4">
                {#if passwordMessage}
                  <div
                    class="flex items-center gap-2 p-3 rounded-lg text-sm border {passwordSuccess
                      ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-destructive/15 border-destructive/20 text-destructive'}"
                  >
                    {#if passwordSuccess}
                      <Check class="h-4 w-4 shrink-0" />
                    {:else}
                      <AlertCircle class="h-4 w-4 shrink-0" />
                    {/if}
                    <p>{passwordMessage}</p>
                  </div>
                {/if}

                <div class="grid gap-2">
                  <Label for="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    bind:value={oldPassword}
                    disabled={isUpdatingPassword}
                    class="max-w-md"
                    required
                  />
                </div>

                <div class="grid gap-2">
                  <Label for="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    bind:value={newPassword}
                    disabled={isUpdatingPassword}
                    class="max-w-md"
                    required
                  />
                </div>

                <div class="grid gap-2">
                  <Label for="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    bind:value={confirmPassword}
                    disabled={isUpdatingPassword}
                    class="max-w-md"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  class="gap-2"
                >
                  {#if isUpdatingPassword}
                    <RefreshCw class="h-4 w-4 animate-spin" />
                    Updating Password...
                  {:else}
                    Update Password
                  {/if}
                </Button>
              </form>
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    </Sidebar.Inset>
  </Sidebar.Provider>
{/if}
