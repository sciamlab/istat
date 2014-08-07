![il dato e' tratto](https://raw.githubusercontent.com/sciamlab/istat/master/img/ildatoetratto.png)
==================
[Il dato e' tratto](http://istatcontest.sciamlab.com/) is an experimental data visualizion based on 3D choropleths that demonstrate how
GeoJSON geometries projected into WebGL 3D canvas and statistical data from the [ISTAT 2011 industry and services census][#1] 
can be combined to create interactive data exploration.

Technologies
------------
The entire application use the Khronos [WebGL][#2] features for embed 3D objects into the [HTML5 canvas element](http://www.w3.org/html/wg/drafts/html/master/scripting-1.html#the-canvas-element)
and that despite isn't yet a W3C standard is now available in all the modern browsers.
WebGL is based on OpenGL and use the onboard accelerated Graphics Processors (GPUs) to efficently manipulate complex 3D objects under realistic scenarios that include cameras, lights and 
and realtime raytracing

WebGL Supported Browsers
-------------------------
WebGL is today supported in many browsers, but in case you experience any issues in your device you can refer to the [Compatibility Grid][#3].
For further information on WebGL support please check on http://get.webgl.org/

Feature details
----------------
The interactive visualization include some little goodies including:

* Ability to rotate,pan and zoom using cursors or keyboard in addition to the mouse.
* Generate PNG image directliy from the visualization canvas using the [FileSaver.js](https://github.com/eligrey/FileSaver.js) library.

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


