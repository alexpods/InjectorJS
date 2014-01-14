Installation
============

InjectorJS is available both on client and server (NodeJS) sides. Follow next instructions to install it.

NodeJS
------

Using [npm](https://npmjs.org/) run next command:
```sh
$ npm install injector-js
```
or if you want to install it globally:
```sh
$ npm install -g injector-js
```

Then use its API to get necessary functionality:
```js
var injector = require('injector-js').injector;
```

Enjoy!


Browser
-------

To install ClazzJS you can use [bower](http://bower.io/) or can just manually download library from [repository](../dist).

####Bower####
Run next command from your project directory:
```sh
$ bower install InjectorJS
```

Then add next tag to html header:
```html
<script type="text/javascript" src="bower_components/InjectorJS/dist/InjectorJS.js"></script>
```
or if you want minified version:
```html
<script type="text/javascript" src="bower_components/InjectorJS/dist/InjectorJS.min.js"></script>
```

####Manually downloading###
Download [full](../dist/InjectorJS.js) or [minified](../dist/InjectorJS.min.js) version of the library. Than put library into your project and add next tag to html header:
```html
<script type="text/javascript" src="path/to/injector-js-library.js"></script>
```

That will add InjectorJS variable to your global scope. Use its API to get necessary functionality:
```html
<script type="text/javascript">
  var injector = InjectorJS.injector;
</script>
```

Enjoy!
