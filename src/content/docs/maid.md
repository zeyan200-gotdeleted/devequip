---
title: Maid
description: Keep track of connections, Instances, threads and other resources, and clean them up in one call.
product: maid
---

Maid keeps a list of things that need cleaning up later, like event connections, Instances and threads. When you're done, one call disconnects, destroys or closes all of them, so nothing is left running in the background or leaking memory.

## Installing

1. Download `maid.luau` from the [product page](../../products/maid/), or copy it from its **Source code** section.
2. Put it in a ModuleScript named `Maid`. If both the server and clients use it, put it in `ReplicatedStorage`.

```lua
local Maid = require(game.ReplicatedStorage.Maid)
local maid = Maid.new()
```

## Giving tasks

`GiveTask` adds something for the Maid to clean up. You can pass an id first to group tasks, so you can clean them up together later.

```lua
maid:GiveTask(workspace.ChildAdded:Connect(onChildAdded))
maid:GiveTask("effects", Instance.new("Part"))
maid:GiveTask("effects", Instance.new("ParticleEmitter"))
```

Each task is stored under its id plus a number (`effects1`, `effects2`, …). `GiveTask` returns a function that cleans up just that one task:

```lua
local cleanup = maid:GiveTask(RunService.Heartbeat:Connect(update))

-- later
cleanup()
```

A thread you give the Maid is started straight away with `coroutine.resume`.

### What a Maid can clean

| Task | How it's cleaned |
| --- | --- |
| `RBXScriptConnection` | Disconnected |
| `Instance` | Destroyed, if it still has a parent |
| `function` | Called |
| `thread` | Closed, if it isn't finished yet |
| Table with a `Destroy` method | `task:Destroy()` |
| Table with a `Cancel` method | `task:Cancel()` |
| Userdata with a `disconnect` method | `task:disconnect()` |

`maid:IsATask(value)` tells you whether a value is one of these types.

## Cleaning up

```lua
maid:DoCleaning()                 -- clean up every task
maid:DoCleaningById("effects")    -- only tasks whose id contains "effects"
maid:DoCleaningByType("Instance") -- only tasks of this type
```

The type you pass to `DoCleaningByType` is what `typeof` returns, such as `"RBXScriptConnection"`, `"Instance"`, `"function"` or `"thread"`.

## Removing tasks without cleaning them

These take tasks off the list but leave them running, for example when something else should take over a connection.

```lua
maid:RemoveTask(connection)    -- that exact task
maid:RemoveTaskById("effects") -- tasks whose id contains "effects"
maid:RemoveTaskByType("thread")
maid:RemoveAllTasks()
```

Id matching uses `string.find`, so `"effects"` also matches an id like `"effects2"` or `"oldeffects"`. Give groups ids that don't overlap.

All the cleaning and removing methods return the Maid, so you can chain them.

## Reference

| Method | Description |
| --- | --- |
| `Maid.new()` | Creates an empty Maid. |
| `maid:GiveTask([id,] task)` | Adds a task and returns a function that cleans up only that task. |
| `maid:IsATask(value)` | Whether the value is a type the Maid can clean. |
| `maid:DoCleaning()` | Cleans up and removes every task. |
| `maid:DoCleaningById(id)` | Cleans up and removes tasks whose id contains `id`. |
| `maid:DoCleaningByType(type)` | Cleans up and removes tasks of that `typeof` type. |
| `maid:RemoveTask(task)` | Removes that task without cleaning it. |
| `maid:RemoveTaskById(id)` | Removes tasks whose id contains `id`, without cleaning them. |
| `maid:RemoveTaskByType(type)` | Removes tasks of that type, without cleaning them. |
| `maid:RemoveAllTasks()` | Removes every task without cleaning it. |
