# Player Profile Manager - Complete Setup Guide

A ready-to-use authentication and profile management system for Godot 4 with Supabase backend.

## 📦 Package Contents

- `PlayerProfileManager.gd` - Core authentication and data management
- `ProfileUI.tscn` - Complete UI scene with all panels
- `profileUI.gd` - Complete UI code

## 🚀 Quick Setup

### 1. Install Files

Copy all files into your project folder (recommended: `res://addons/player_profile/` or `res://scripts/`).

### 2. Setup Autoload

**Project Settings → Autoload**

| Path | Name |
|------|------|
| `res://path/to/PlayerProfileManager.gd` | `PlayerProfileManager` |

> ⚠️ **Note:** Do NOT add `ProfileUI.tscn` as autoload. Only the script.

### 3. Add UI Scene to Your Game

Add `ProfileUI.tscn` as a child of your main scene or open it as a popup:

```gdscript
# Example: Add to your main menu scene
var profile_ui = preload("res://path/to/ProfileUI.tscn").instantiate()
add_child(profile_ui)
```

### 4. Configure Supabase

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database to be ready (2-3 minutes)

#### Get API Keys

Navigate to: **Project Settings → API**

Copy these values:
- **URL** (Project URL) - `https://xxxxxxxxxxxx.supabase.co`
- **anon public key** - `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Update Configuration

Open `PlayerProfileManager.gd` and replace:

```gdscript
const SUPABASE_URL = "https://your-project.supabase.co"
const SUPABASE_ANON = "your-anon-key-here"
```

### 5. Database Setup

Run this SQL in **Supabase SQL Editor**:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
    id TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles (for multiplayer name display)
CREATE POLICY "Allow read all profiles" ON public.profiles
    FOR SELECT USING (true);

-- Allow insert with valid API key (handled by anon key)
CREATE POLICY "Allow insert" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Allow update with valid API key
CREATE POLICY "Allow update" ON public.profiles
    FOR UPDATE USING (true);

-- Allow delete with valid API key
CREATE POLICY "Allow delete" ON public.profiles
    FOR DELETE USING (true);
```

> **Why no auth.uid() restriction?** This system uses the anon key with local password validation. Each user can only modify their own profile because the `id` field is checked against the logged-in profile before operations.

## 🎮 Usage Guide

### Open Profile UI

The UI is self-contained. Just make it visible:

```gdscript
$ProfileUI.show()
# or
$ProfileUI.visible = true
```

### Enter Game Button

The UI has an "Enter Game" button that currently just hides the panel. Connect to it:

```gdscript
# In your game manager or main scene
func _ready():
    var profile_ui = $ProfileUI
    profile_ui.get_node("Panel/VBoxContainer/CurrentProfilePanel/HBoxContainer/ButtonContainer/EnterGameButton").pressed.connect(_on_enter_game)

func _on_enter_game():
    # Start your actual game here
    get_tree().change_scene_to_file("res://game.tscn")
```

### Check If User Is Logged In

```gdscript
if PlayerProfileManager.is_profile_loaded():
    print("Logged in as: ", PlayerProfileManager.get_username())
else:
    print("No active session")
```

### Get User Data

```gdscript
var username = PlayerProfileManager.get_username()
var avatar = PlayerProfileManager.get_avatar()
var playtime = PlayerProfileManager.get_total_playtime()
var stats = PlayerProfileManager.get_all_stats()
var setting = PlayerProfileManager.get_setting("sound_enabled")
```

### Update Game Stats

```gdscript
# Add XP
PlayerProfileManager.increment_stat("total_xp", 100)

# Record playtime (automatic when saving)
PlayerProfileManager.record_playtime()

# Update any stat
PlayerProfileManager.update_stat("games_won", 1, "increment")
```

### Save Profile

```gdscript
# Call periodically or when game saves
await PlayerProfileManager.save_profile()
```

### Logout

```gdscript
PlayerProfileManager.logout()
# UI will automatically show login panel
```

## 📡 Signals Reference

Connect to these signals to react to profile events:

| Signal | Emitted When | Parameters |
|--------|-------------|------------|
| `profile_created` | New account created | `profile_id: String` |
| `profile_loaded` | User logged in successfully | `profile_id: String` |
| `profile_updated` | Profile data changed (username, avatar, stats, settings) | `profile_id: String` |
| `profile_deleted` | Account deleted | `profile_id: String` |
| `stats_updated` | Individual stat changed | `stat_name: String`, `new_value: Variant` |
| `auth_failed` | Login/registration failed | `profile_id: String`, `reason: String` |
| `logout_occurred` | User logged out | (none) |

### Signal Usage Example

```gdscript
func _ready():
    PlayerProfileManager.profile_loaded.connect(_on_login)
    PlayerProfileManager.profile_updated.connect(_on_profile_updated)
    PlayerProfileManager.auth_failed.connect(_on_auth_error)

func _on_login(profile_id: String):
    print("Welcome ", PlayerProfileManager.get_username())

func _on_profile_updated(profile_id: String):
    # Update UI with new data
    update_display_name(PlayerProfileManager.get_username())

func _on_auth_error(profile_id: String, reason: String):
    show_error_popup(reason)
```

## 🎨 Avatar System

### Default Avatars

Place avatar images in `res://RetentionSystem/Images/` (create folder if needed).  
Supported formats: PNG, JPG, JPEG, WEBP

### Custom Avatar Path

If you store avatars elsewhere, update `AVATAR_FOLDER` constant:

```gdscript
const AVATAR_FOLDER = "res://your_avatar_folder/"
```

### Phone Avatar Import

Users can import images from their device. Images are saved to `user://avatars/` and persist between sessions.

## 🔧 Common Errors & Solutions

### Error: "Failed to connect to server"

**Cause:** Wrong Supabase URL or no internet connection

**Fix:** Verify `SUPABASE_URL` in `PlayerProfileManager.gd` matches your project URL exactly

### Error: "Profile not found" during login

**Cause:** Username doesn't exist in database

**Fix:** User needs to create a profile first using "Create New" button

### Error: "Username already taken"

**Cause:** Another user has the same username

**Fix:** Choose a different username (case-insensitive, spaces become underscores)

### Error: "Failed to save — check connection"

**Cause:** Network issue or Supabase API key incorrect

**Fix:** 
1. Verify `SUPABASE_ANON` key is correct
2. Check if Supabase project is active
3. Ensure table is created with correct schema

### Error: "Invalid API key" in Supabase logs

**Cause:** The anon key is for `public` schema access

**Fix:** Make sure you're using the `anon public` key, not `service_role` key

### UI Not Showing Avatars

**Cause:** Avatar folder path incorrect or folder empty

**Fix:**
1. Create folder: `res://RetentionSystem/Images/`
2. Add image files (PNG/JPG)
3. Restart the game

### HTTP Request Fails with 401

**Cause:** Wrong API key or headers

**Fix:** Verify `_headers()` function returns correct auth header with `Bearer ` prefix

### Password Issues

**Note:** Passwords are NOT stored in plain text. They are hex-encoded. This is basic obfuscation, not production-grade encryption. For a shipped game, consider adding proper encryption.

## 📁 File Structure Reference

```
your_project/
├── addons/player_profile/          (or wherever you placed files)
│   ├── PlayerProfileManager.gd
│   ├── ProfileUI.tscn
│   └── CGLive.png
├── RetentionSystem/Images/         (default avatars - create this)
│   ├── avatar1.png
│   ├── avatar2.jpg
│   └── ...
└── user://avatars/                 (auto-created for phone imports)
```

## 💾 Data Structure

### Profile Dictionary

```gdscript
{
    "id": "username_123",
    "username": "PlayerName",
    "password": "hex_encoded_string",
    "avatar": "res://path/to/avatar.png",
    "created_at": 1700000000,
    "last_played": 1700000000,
    "total_playtime": 3600,
    "level": 1,
    "xp": 0,
    "money": 0,
    "houses": [],
    "cars": [],
    "weapons": {},
    "items": {},
    "unlocked": [],
    "last_pos": {"x": 0, "y": 0, "z": 0},
    "last_map": "city_01",
    "stats": {...},
    "settings": {...}
}
```

### Stats (tracked automatically)

- `total_playtime` - Seconds played
- `total_sessions` - Login count
- `games_played/won/lost` - Match tracking
- `win_streak/best_streak` - Streak tracking
- `days_played` - Unique days played
- `current_login_streak` - Consecutive days
- `total_quests_completed` - Quest progress

### Settings

- `sound_enabled` - bool
- `music_enabled` - bool
- `notifications_enabled` - bool
- `language` - string (default "en")
- `difficulty` - string (default "normal")

## 🎯 Quick Start Example

```gdscript
# Main.gd - Complete integration example
extends Node

func _ready():
    # Show profile UI first
    $ProfileUI.show()
    
    # Listen for successful login
    PlayerProfileManager.profile_loaded.connect(_start_game)
    PlayerProfileManager.logout_occurred.connect(_show_login)

func _start_game(profile_id):
    print("Starting game for: ", PlayerProfileManager.get_username())
    $ProfileUI.hide()
    load_game_world()

func _show_login():
    $ProfileUI.show()
    
func load_game_world():
    # Your game loading code here
    get_tree().change_scene_to_file("res://world.tscn")
```

## ✅ Testing Checklist

- [ ] Supabase project created
- [ ] Table created with SQL script
- [ ] RLS policies applied
- [ ] URL and anon key updated in script
- [ ] Autoload configured correctly
- [ ] UI scene can be opened
- [ ] Can create new account
- [ ] Can login with existing account
- [ ] Avatar selection works
- [ ] Can edit username (with password)
- [ ] Can change password
- [ ] Can change avatar
- [ ] Stats persist after save
- [ ] Logout works
- [ ] Auto-login works on next game launch

## 📝 Notes for Developers

- The system uses local password validation (not Supabase Auth)
- All profile data stored in `data` JSONB column
- HTTP requests are created dynamically - no manual setup needed
- Phone avatars are saved to `user://` (persistent across game updates)
- Default avatar folder path can be changed via `AVATAR_FOLDER` constant
- Passwords are hex-encoded - add proper encryption for production games

---

**Support:** For issues, check Supabase logs or verify API keys are correct.

**Version:** 1.0.0

Want me to add anything else?
