---
title: Promise
description: Handle work that can succeed or fail, with chainable callbacks for each outcome.
product: promise
---

A Promise represents work that either succeeds with a value or fails with a reason. Instead of wrapping everything in `pcall`, you say what should happen in each case and chain the steps together. It works like Promises in JavaScript.

## Installing

1. Download `promise.lua` from the [product page](../../products/promise/), or copy it from its **Source code** section.
2. Put it in a ModuleScript named `Promise`. If both the server and clients use it, put it in `ReplicatedStorage`.

```lua
local Promise = require(game.ReplicatedStorage.Promise)
```

## States

A Promise is always in one of three states, stored in `promise.state`:

| State | Meaning |
| --- | --- |
| `"Pending"` | Not finished yet. |
| `"Fulfilled"` | Succeeded. The result is in `promise.value`. |
| `"Rejected"` | Failed. The reason is in `promise.reason`. |

Once a Promise is fulfilled or rejected, it stays that way.

## Creating a Promise

`Promise.new` takes a function that gets `resolve` and `reject`. Call `resolve(value)` when the work succeeds and `reject(reason)` when it fails. If the function errors, the Promise is rejected with the error.

```lua
local DataStoreService = game:GetService("DataStoreService")
local store = DataStoreService:GetDataStore("Coins")

local function loadCoins(userId)
	return Promise.new(function(resolve, reject)
		local ok, result = pcall(store.GetAsync, store, userId)
		if ok then
			resolve(result or 0)
		else
			reject(result)
		end
	end)
end
```

`Promise.resolve(value)` and `Promise.reject(reason)` create a Promise that is already fulfilled or rejected.

## Handling the result

`Then` takes a callback for success and, optionally, one for failure. It returns a new Promise, so steps can be chained. Whatever a callback returns is passed on to the next step.

```lua
loadCoins(player.UserId)
	:Then(function(coins)
		return coins * 2
	end)
	:Then(function(doubled)
		print("Doubled coins:", doubled)
	end)
	:catch(function(err)
		warn("Couldn't load coins:", err)
	end)
	:finally(function()
		print("Done loading")
	end)
```

- `catch(callback)` only handles failure. It's the same as `Then(nil, callback)`.
- `finally(callback)` runs the callback whether the Promise succeeded or failed. The callback gets no arguments.
- A failure handler that returns normally *recovers* the chain: the next step is fulfilled with what it returned.

`Then` is capitalised because `then` is a reserved word in Luau. `catch` and `finally` are lowercase.

## Combining Promises

`Promise.all(list)` waits for every Promise in the list. It's fulfilled with a table of their values, in the same order, or rejected as soon as any of them fails.

```lua
Promise.all({ loadCoins(1), loadCoins(2), loadCoins(3) })
	:Then(function(results)
		print(results[1], results[2], results[3])
	end)
```

`Promise.race(list)` settles the same way as whichever Promise in the list finishes first.

## Reference

| Member | Description |
| --- | --- |
| `Promise.new(executor)` | Creates a Promise. `executor` gets `(resolve, reject)`. |
| `Promise.resolve(value)` | A Promise that is already fulfilled with `value`. |
| `Promise.reject(reason)` | A Promise that is already rejected with `reason`. |
| `Promise.all(list)` | Fulfilled with all values once every Promise succeeds; rejected if any fails. |
| `Promise.race(list)` | Settles like the first Promise in the list to finish. |
| `promise:Then(onFulfilled, onRejected)` | Runs a callback for the outcome and returns a new Promise. |
| `promise:catch(onRejected)` | Runs a callback on failure and returns a new Promise. |
| `promise:finally(onFinally)` | Runs a callback either way and returns a new Promise. |
| `promise.state` | `"Pending"`, `"Fulfilled"` or `"Rejected"`. |
| `promise.value` | The value it was fulfilled with. |
| `promise.reason` | The reason it was rejected with. |
