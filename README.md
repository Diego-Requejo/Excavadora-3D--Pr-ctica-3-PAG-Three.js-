# Excavadora 3D - Práctica 3 PAG (Three.js)

## Descripción del proyecto
Proyecto desarrollado para la asignatura Programación de Aplicaciones gráficos (DESI).
La idea es realizar un modelo 3D de una excavadora con diferentes piezas que se pueden mover por el usuario
usando la librería Three.js.
Enlace al repositorio de Gitlab: https://gitlab.inf.uva.es/dierequ/practica3_pag
## Acceso al modelo
A través del siguiente enlace: https://practica3-pag-5b766b.pages.gitlab.inf.uva.es/

## Descripción del funcionamiento del modelo
Para el movimiento de la excavadora se usarán las flechas del teclado para avanzar hacia adelante o hacia atrás con las flechas de arriba y abajo, respectivamente, o rotar sobre su propio eje con las flechas de izquierda y derecha. Es posible pulsar a la vez una de las fechas de arriba o abajo y una de las de izquierda o derecha para que la excavadora se mueva en diagonal.

Para movimiento de las distintas piezas de la excavadora se puede utilizar o bien los botones disponibles en la interfaz o las teclas que se indican entre paréntesis en dichos botones.

El movimiento de la Cámara se usan los siguientes controles:<br> 
    •	Click izquierdo + arrastrar: Rotar<br>
    •	Click derecho + arrastrar: Desplazar<br>
    •	Rueda del ratón: Zoom<br>

Por último, existen dos botones adicionales que hacen lo siguiente:<br>
    •	Botón de “🔦 Foco”: si se activa el botón el foco que inicialmente se encuentra alumbrando el centro de la escena seguirá a la excavadora y si se desactiva se quedará fijo en el último punto al que estaba apuntando.<br>
    •	Botón de “📷 Cámara”: si se activa el botón la cámara conservará su posición actual, pero girará para apuntar hacia la excavadora y mientras el botón permanezca activado la cámara seguirá a la excavadora y no se permitirá el movimiento libre de la Cámara. Si está desactivado la cámara podrá moverse libremente por el usuario como se indicó posteriormente.<br>



## 💻 Tecnologías utilizadas
* HTML5
* JavaScript (ES6)
* Three.js
* OrbitControls.js - utilizada para el movimiento de la cámara




## 👨‍💻 Autor
Diego Requejo Alonso (dierequ) - diego.requejo23@estudiantes.uva.es