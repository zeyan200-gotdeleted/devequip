---
title: Nexus Dynamics installation
description: Add the Nexus Dynamics admin panel to your game, turn on the settings it needs, and set up ranks.
product: nexusdynamics
---

Nexus Dynamics is an admin panel for moderating and managing your game. This page covers adding it to your game and getting it ready to use.

## 1. Add it to your game

Nexus Dynamics is a **package**, so the Creator Store version can update itself.

1. On the [product page](../../products/nexusdynamics/), choose **Get it on the Creator Store** and take the model.
2. In Roblox Studio, open the **Toolbox** and go to **Inventory → My Models**.
3. Click **Nexus Dynamics** to insert it into Workspace.

You can also download the `.rbxm` file from the product page and insert it with **Model → Model**, but that copy won't receive package updates.

## 2. Turn on the game settings

Nexus Dynamics needs four settings that Roblox switches off by default. Open **File → Game Settings → Security** (in older Studio versions, **Home → Game Settings → Security**) and turn on:

| Setting | What Nexus Dynamics uses it for |
| --- | --- |
| Allow HTTP Requests | Requests to remote servers |
| Enable Studio Access to API Services | Saving data with Data Stores, including in Studio |
| Allow Third Party Teleports | Moving players between places |
| Allow Third Party Sales | Selling third-party UGC assets |

The game has to be published for these settings to be available.

## 3. Run setup

Ranks are set up in game, so you don't have to add user IDs to a script.

1. Publish the game and join it, or press **Play** in Studio.
2. Run `/setup` and follow its steps to give people their ranks.

After setup, open the command bar to run commands. It suggests commands as you type.

## Keeping it up to date

To get the latest version, right-click the package's source module and choose **Get Latest Package**. To update automatically, turn on **AutoUpdate** in its **PackageLink**.

## Works with

- TopbarPlus v3.0.0 by ForeverHD
- The Roblox Ban API, including IP bans

## Need help?

Ask in the Dev Equip Discord, or see [Support](../../support/).
