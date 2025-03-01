# FancyGrid

Build v1.7.180

FancyGrid - JavaScript grid library with charts integration and server communication.
  
## Установка

#### *npm*
```
npm install fancygrid
```

#### *CDN*
```
https://cdn.jsdelivr.net/npm/fancygrid/client/fancy.min.css
https://cdn.jsdelivr.net/npm/fancygrid/client/fancy.min.js
```

## Быстрый старт
Включите ссылку на библиотеку Fancy Grid

```html
<link href="https://cdn.jsdelivr.net/npm/fancygrid/client/fancy.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/fancygrid/client/fancy.min.js"></script>
```
The `FancyGrid` object is now accessible. Happy griding!
```html
<div id="grid"></div>
<script>
document.addEventListener("DOMContentLoaded", () => {

new FancyGrid({
  renderTo: 'grid',
  width: 300,
  height: 200,
  data: [
    {name: 'Nick', age: 30},
    {name: 'Fred', age: 25},
    {name: 'Mike', age: 35}
  ],  
  columns: [{
    index: 'name',
    title: 'Name',    
    type: 'string'
  },{
    type: 'number',
    index: 'age',
    title: 'Age'
  }]
});

});
</script>
```

## Load FancyGrid as an ES6 module
Since FancyGrid supports CommonJS, it can be loaded as an ES6 module with the use of transpilers.  
Two common transpilers are [Babel](https://babeljs.io/) and [TypeScript](https://www.typescriptlang.org/). These have different interpretations of a CommonJS module, which affects your syntax.  
*The following examples presumes you are using npm to install FancyGrid.*
### Babel
```js
import Fancy from 'fancygrid';

// Generate the grid
Fancy.Grid({
  // config
});

// Generate the form
new Fancy.Form({
  //config
});

// Generate the tabs
new Fancy.Tab({
  //config
});
```
### TypeScript
```js
import * as Fancy from 'fancygrid';

// Generate the grid
Fancy.Grid({
  // config
});

// Generate the form
new Fancy.Form({
  //config
});

// Generate the tabs
new Fancy.Tab({
  //config
});
```

## Package Directory
The package includes the following:
```
|   README.md
├── client
│   ├── fancy.full.min.js
│   ├── fancy.min.js
│   ├── fancy.min.css
│   ├── modules
├── src
│   ├── js
│   ├── less
│   ...
```

## Debug
In case you want to debug FancyGrid there are several approaches.  

### Debug files
Include css file ```/client/fancy.css```  
Include js file ```/src/js/load-all.js```  
After that set
```
Fancy.MODULESLOAD = false;
```

### Debug full build
Include css file ```/client/fancy.css```  
Include js file ```/src/js/fancy.full.js```  

### Debug with auto-loading modules
Include css file ```/client/fancy.css```  
Include js file ```/src/js/fancy.js```  
Set modules path
```
Fancy.MODULESDIR = '/client/modules/';
Fancy.DEBUG = true;
```

## Установить grunt глобально
```
npm install -g grunt
```

## Пользовательская сборка
```
grunt debug
```
### Сборка релиза
```
grunt release
```

## Support
Если вам нужна какая-либо помощь или вы хотите сообщить о любых ошибках, обнаруженных в Fancy Grid, пожалуйста, свяжитесь с нами по адресу support@fancygrid.com