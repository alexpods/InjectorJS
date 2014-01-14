InjectorJS
==========

InjectorJS is a simple Dependency Injection Container for JavaScript. It helps you to remove of hard-corded
dependencies and make it possible to change them at any time.

Documentation
-------------

> This docs describe many features of the library, but not all. Use source to learn InjectorJS better.

###Installation###

For installation read [related chapter](https://github.com/alexpods/InjectorJS/blob/master/docs/installation.md).

###Usage###

Definition of simple objects (parameters):
```js
injector.set('name', 'Bob');
injector.set('PI', 3.14);
injector.set('currentTime', new Date());
```

Defition of objects by factory functions:
```js
injector.set('auto', function() {
  return {
      color: this.get('auto_color'),
      type:  this.get('auto_type')
});
```

Factory functions has access to current injector making it possible to references to other objects (inject dependencies).
Objects are created only when you require them. These cause to that order of the definitions does not matter and there is no performance penalty.

You can define several objects in one set method call:
```js
injector.set({
    auto_color: function() {
        return Math.random() < 0.5 ? 'black' : 'white';
    }
    auto_type: function() {
        return Math.random() < 0.5 ? 'hatchback' : 'sedan';
    },
    auto: function() {
        return {
            color: this.get('auto_color'),
            type:  this.get('auto_type)
    }
})
```

You can add object factory to injector to simplify creation of common type objects. Before creation object value will be passed to appropriate object factory:
```js
injector.setFactory('x60', function(value) {
    return value*60;
});

injector.set('hours_in_minutes', 'x60', function() {
    return 5;
});

injector.get('hours_in_minutes'); // 300

injector.setFactory('join', {
    create: function(strings) {
        return strings.join(' ');
    }
});

injector.set('hello', 'join', ['hello', 'world', '!']);

injector.get('hello'); // hello world !
```

As you see object factory can be a function or an object with create method. By default there are 3 object factories:
* Object Factory  - default factory - just return object;
* Service Factory - create instances of classes;
* Clazz Factory   - create clazzes (see [ClazzJS](https://github.com/alexpods/ClazzJS))

```js
injector.set({
    service: {
        person: function() {
            return {
                class: this.get('person_class'),
                init:  [this.get('person_age'],
                call: {
                    setName: [this.get('person_name')]
                }
            }
        }
    },
    clazz: {
        person_class2: function() {
            return {
                name:   'Some/Clazz/Name',
                parent: 'Some/Clazz/Parent',
                deps: [10,20,30]
            }
        }
    },
    person_class: function() {
        
        var Person = function(age) {
            this.name = undefined;
            this.age  = age;
        };
        Person.prototype.setName = function(name) {
            this.name = name;
        }
        
        return Person;
    },
    person_age: 10,
    person_name: 'Bob'
});

var person = injector.get('person');

console.log(person.name); // 'Bob'
console.log(person.age);  // 10
```

Dependencies
------------
* [ClazzJS](https://github.com/alexpods/ClazzJS)

License
-------
Copyright (c) 2013 Aleksey Podskrebyshev. Licensed under the MIT license.


[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/c5cb0521484ffc4a85e86105fef31a0a "githalytics.com")](http://githalytics.com/alexpods/injectorjs)

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/alexpods/injectorjs/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

