![il dato e' tratto](https://raw.githubusercontent.com/sciamlab/istat/master/img/ildatoetratto.png)
==================
[Il dato e' tratto](http://istatcontest.sciamlab.com/) is an experimental data visualizion based on 3D choropleths that demonstrate how
GeoJSON geometries projected into 3D WebGL scene and statistical data from the [ISTAT 2011 industry and services census][#1] 
can be combined to create interactive data exploration

Technologies
------------
The entire application use the Khronos [WebGL][#2] features to embed 3D objects into the [HTML5 canvas element](http://www.w3.org/html/wg/drafts/html/master/scripting-1.html#the-canvas-element).
Despite WebGL isn't yet a W3C standard is now available in all the modern browsers.
WebGL is based on OpenGL and use the onboard accelerated Graphics Processors (GPUs) to efficently manipulate complex 3D objects under realistic scenarios that include cameras, lights and and realtime raytracing

WebGL Supported Browsers
-------------------------
WebGL is today supported in many browsers, including those present in recent smartphones, but in case you experience any issues in your device you can refer to the [Compatibility Grid][#3].
For further information on WebGL support please check on http://get.webgl.org/

Feature and technology details
-------------------------------

Used Technologies:
The entire application is written in Javascript with 0 server side logic. 
Datasets, based on the ISTAT datawarehouse are served directly from the web server stored in lightweight json packages

*  the Italy regions and provinces are rendered into WebGL scene using GeoJSON simplified shapes based on the original [ISTAT shapefiles](http://www.istat.it/it/archivio/104317).
*  the application use the following libraries:
  * the latest [Twitter Bootstrap v3.2.0](http://getbootstrap.com/) 
  * the latest [JQuery v1.11.1](http://jquery.com/)
  * a lightweight [bootstrap select](http://silviomoreto.github.io/bootstrap-select/) extension
  * a small footprint [bootstrap slider](http://www.eyecon.ro/bootstrap-slider/)
  * the latest version of the [Mike Bostock](http://bost.ocks.org/mike/) awesome [D3.js Data Driven Documents v3.4.11](http://d3js.org/) library
  * for 3D WebGL javascript manipulation the latest [three.js r68](http://threejs.org/)
  * a revised d3.js to three.js bridging library to project GeoJSON geometries into a WebGL coordinates system based on [d3-threeD.js](https://github.com/asutherland/d3-threeD) work. 

The interactive visualization include some little goodies including:

* responsive capabilities and support for common desktop, tablet and mobile devices display size.
* Ability to rotate,pan and zoom with mouse/keyboard.
* Generate PNG image directliy from the visualization canvas using the [FileSaver.js](https://github.com/eligrey/FileSaver.js) library just pressing the "p" key.


License
--------
The source code and data and creative content of this work is distributed
using two different licenses:
 
* All the design and application data is license using [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)
  The geographic shapes and all the statistical indicators values consist
  of a derivative work of the ISTAT data which is distributed using a
  CC BY 3.0 Italian as better described in the [ISTAT Licensing page](http://www.istat.it/it/note-legali)
* the source code of this work is licensed under the LGPLv3

for further information please read our [LICENSE](https://raw.githubusercontent.com/sciamlab/istat/master/LICENSE) file

[#1]: http://censimentoindustriaeservizi.istat.it/ "Censimento Industria e Servizi ISTAT 2011"
[#2]: http://www.khronos.org/webgl/wiki/Main_Page "WebGL wiki at Khronos"
[#3]: http://caniuse.com/webgl "Can I use WebGL and 3D Canvas graphics?"


