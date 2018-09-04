"use strict";

function setPixel(_imgData, _x, _y, _r, _g, _b, _a){
  let index = (_x+_y*_imgData.width)*4;
  _imgData.data[index+0] = _r;
  _imgData.data[index+1] = _g;
  _imgData.data[index+2] = _b;
  _imgData.data[index+3] = _a;
}

function getRed(imageData, x, y){
  let index = (x+y*imageData.width)*4;
  return imageData.data[index+0];
}

function getGreen(imageData, x, y){
  let index = (x+y*imageData.width)*4;
  return imageData.data[index+1];
}

function getBlue(imageData, x, y){
  let index = (x+y*imageData.width)*4;
  return imageData.data[index+2];
}

//Cambia el color de fondo
function backgroundColor(imageData,r,g,b){
  for(let x = 0; x<imageData.width ;x++){
    for(let y = 0; y<imageData.height;y++){
      setPixel(imageData,x,y,r,g,b,255);
    }
  }
}

$( document ).ready(function() {
  let canvas = $('#canvas');
  let ctx = $(canvas)[0].getContext("2d");
  // let imageData = ctx.createImageData($(canvas).attr("width"), $(canvas).attr("height"));
  let mouseX = 0;
  let mouseY = 0;
  let paint_mode = false;
  let color = {r:0,g:0,b:0};
  let lastX = null;
  let lastY = null;
  let cursor = null;
  //Almaceno las coordenadas de los cursores personalizados
  let coordinates = {
    "pencil" :{"x":-1, "y":27},
    "eraser" :{"x":0, "y":7 }
  }

  $(".toolIcon").on("click",function(){
    //Herramienta seleccionada
    let tool = $(this).data("target");
    //Coordenadas de la herramienta
    let x = coordinates[tool].x;
    let y = coordinates[tool].y;
    //Construyo el value css con los datos obtenidos
    cursor = "url('img/cursors/"+tool+".png')"+x+" "+y+", default";
  });

  $(canvas).hover(function(){
    $(this).css("cursor", cursor);
  });

  //Función ejecutada mientras el mouse esta clickeado sobre el canvas
  $(canvas).on("mousedown", function(event){
    //Cuando se clickea el canvas se activa el modo dibujo
    paint_mode = true;
  });

  //Función ejecutada cuando el click es soltado sobre el canvas
  $(canvas).on("mouseup", function(){
    //Cuando se suelta el mouse se desactiva el modo dibujo
    paint_mode = false;
    lastX = null;
    lastY = null;
  });

  //Función ejecutada cuando el mouse deja el canvas
  $(canvas).on("mouseleave",function(){
    lastX = null;
    lastY = null;
  });
  //Función ejecutada cuando el mouse se mueve sobre el canvas
  $(canvas).on("mousemove",function(event){
    //Si esta activado el modo dibujo
    if(paint_mode){
      //Obtengo las coordenadas del mouse con respecto al canvas
      mouseX = event.clientX - this.offsetLeft;
      mouseY = event.clientY - this.offsetTop;
      //Si estoy dibujando un trazo continuó
      if(lastX!=null && lastY!=null){
        //Uno el punto anterior con el punto actual
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
      //Recuerdo la ultima posición
      lastX = mouseX;
      lastY = mouseY;
    }
  });
});
