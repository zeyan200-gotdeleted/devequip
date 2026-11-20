---
title: Class
description: Build objects with tracked properties, attributes and automatic cleanup.
product: class
---

Class gives you objects that behave a lot like Roblox Instances: they have properties you can watch for changes, attributes, and a `Destroy` method that cleans up everything they own. Cleanup is handled by a built-in [Maid](../maid/), so you don't need to add Maid separately.

## Installing

1. Download `class.luau` from the [product page](../../products/class/), or copy it from its **Source code** section.
2. Put it in a ModuleScript named `Class`. If both the server and clients use it, put it in `ReplicatedStorage`.

```lua
local Class = require(game.ReplicatedStorage.Class)
```

## Creating an object

`Class.new(properties)` takes a table of starting properties and returns the new object. Read and write properties like you would on an Instance.

```lua
local door = Class.new({
	ClassName = "Door",
	Name = "FrontDoor",
	Open = false,
	Model = workspace.FrontDoor,
})

print(door.Name)      --> FrontDoor
print(door.UniqueId)  --> a GUID, unique to this object
print(tostring(door)) --> FrontDoor
```

- `ClassName` defaults to `"Class"` when you leave it out.
- `UniqueId` is always generated for you with `HttpService:GenerateGUID()`.
- `tostring(object)` returns its `Name`, or its `ClassName` when it has no name.

## Watching for changes

Setting a property to a new value fires `Changed` with the property's name and new value. Setting it to the value it already has does nothing.

```lua
door.Changed:Connect(function(property, value)
	print(property, "is now", value)
end)

door.Open = true --> Open is now true
```

To listen to one property only, use `GetPropertyChangedSignal`. Its event gets the new value.

```lua
door:GetPropertyChangedSignal("Open"):Connect(function(isOpen)
	print(isOpen and "Opened" or "Closed")
end)
```

## Attributes

Attributes are extra values stored on the object, separate from its properties. `SetAttribute` returns the object, so calls can be chained.

```lua
door:SetAttribute("Locked", true):SetAttribute("KeyId", 42)

door.AttributeChanged:Connect(function(name, value)
	print(name, value)
end)

print(door:GetAttribute("Locked")) --> true
```

## Getting values

`GetValues()` returns a table with the current value of every property you passed to `Class.new`. `ClassName` and `UniqueId` aren't included, and neither are properties you added later.

```lua
local values = door:GetValues()
--> { Name = "FrontDoor", Open = true, Model = FrontDoor }
```

## Cleaning up

Anything Maid can clean that you assign to a property is handed to the object's Maid automatically. That covers connections, Instances, functions, threads, and tables with a `Destroy` or `Cancel` method.

```lua
door.Touched = door.Model.Touched:Connect(function() end)
```

`BindToClose(callback)` sets a function to run when the object is destroyed. Calling `Destroy()` then:

1. Runs the `BindToClose` callback, if there is one.
2. Fires the `Destroying` event.
3. Cleans up everything the object's Maid holds.
4. Destroys any Instances among the object's original properties.

```lua
door:BindToClose(function()
	print("Saving door state")
end)

door.Destroying:Connect(function()
	print("Door destroyed")
end)

door:Destroy()
```

## Reference

| Member | Description |
| --- | --- |
| `Class.new(properties)` | Creates an object from a table of properties. |
| `object.ClassName` | The class name, `"Class"` by default. |
| `object.UniqueId` | A GUID generated when the object is created. |
| `object.Changed` | Fires `(property, value)` when a property changes. |
| `object.AttributeChanged` | Fires `(name, value)` when an attribute is set. |
| `object.Destroying` | Fires when `Destroy` is called. |
| `object:GetPropertyChangedSignal(property)` | An event that fires `(value)` when that property changes. |
| `object:GetValues()` | The current values of the original properties. |
| `object:GetAttribute(name)` | The attribute's value, or `nil`. |
| `object:SetAttribute(name, value)` | Sets an attribute and returns the object. |
| `object:BindToClose(callback)` | Sets a function to run on `Destroy`, and returns the object. |
| `object:Destroy()` | Runs the close callback and cleans up the object. |
