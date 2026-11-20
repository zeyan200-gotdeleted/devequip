---
title: Signal
description: A BindableEvent and BindableFunction in one object, for events between your scripts.
product: signal
---

Signal combines a BindableEvent and a BindableFunction into one object. Use it to fire events and call functions between your own scripts, with the same methods you already know from those Instances, without creating anything in the Explorer.

## Installing

1. Download `signal.lua` from the [product page](../../products/signal/), or copy it from its **Source code** section.
2. Put it in a ModuleScript named `Signal`. If both the server and clients use it, put it in `ReplicatedStorage`.

```lua
local Signal = require(game.ReplicatedStorage.Signal)
local roundEnded = Signal.new()
```

A Signal only exists inside the script that created it. To use it from other scripts, return it from a ModuleScript that those scripts require. Like BindableEvents, Signals can't cross between the server and clients; use RemoteEvents for that.

## Events

```lua
roundEnded:Connect(function(winner, time)
	print(winner, "won in", time, "seconds")
end)

roundEnded:Fire("Builderman", 92)
```

- `Connect(callback)` runs the callback every time the Signal fires, and returns the connection.
- `Once(callback)` runs the callback the next time only.
- `Wait()` yields until the Signal fires and returns what it was fired with.
- `ConnectParallel(callback)` runs the callback in parallel, for scripts under an Actor.

To stop listening, call `Disconnect()` on the connection you got back. `Event` is the underlying BindableEvent's event, if you need to pass it somewhere that expects an `RBXScriptSignal`.

## Functions

The function side works like a BindableFunction: one script sets the handler, another calls it and gets the result back.

```lua
local getScore = Signal.new()

getScore.OnInvoke = function(player)
	return scores[player]
end

local score = getScore:Invoke(player)
```

`Invoke` yields until the handler returns.

## Reference

| Member | Description |
| --- | --- |
| `Signal.new()` | Creates a Signal. |
| `signal:Fire(...)` | Fires the event with these arguments. |
| `signal:Connect(callback)` | Runs the callback on every fire. Returns a connection. |
| `signal:Once(callback)` | Runs the callback on the next fire only. Returns a connection. |
| `signal:ConnectParallel(callback)` | Like `Connect`, but runs in parallel. |
| `signal:Wait()` | Yields until the next fire and returns its arguments. |
| `signal:Invoke(...)` | Calls the `OnInvoke` handler and returns its result. |
| `signal.OnInvoke` | The function that handles `Invoke`. |
| `signal.Event` | The underlying `RBXScriptSignal`. |
