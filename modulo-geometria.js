

/*

    Tareas:
    ------

    1) Modificar a función "generarSuperficie" para que tenga en cuenta los parametros filas y columnas al llenar el indexBuffer
       Con esta modificación deberían poder generarse planos de N filas por M columnas

    2) Modificar la funcion "dibujarMalla" para que use la primitiva "triangle_strip"

    3) Crear nuevos tipos funciones constructoras de superficies

        3a) Crear la función constructora "Esfera" que reciba como parámetro el radio

        3b) Crear la función constructora "TuboSenoidal" que reciba como parámetro la amplitud de onda, longitud de onda, radio del tubo y altura.
        (Ver imagenes JPG adjuntas)
        
        
    Entrega:
    -------

    - Agregar una variable global que permita elegir facilmente que tipo de primitiva se desea visualizar [plano,esfera,tubosenoidal]
    
*/
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }
var forma= getUrlVars()["forma"]

var superficie3D;
var mallaDeTriangulos;

var filas=20;
var columnas=20;
var radio = 1;
var altura = 4;
var amp_onda = 0.15;
var long_onda = 0.25;

function crearGeometria(){
        
    if (forma == "TuboSenoidal"){
        superficie3D=new TuboSenoidal(amp_onda, long_onda, radio, altura);
    }else{
        superficie3D=new Esfera(radio);
    }
    mallaDeTriangulos=generarSuperficie(superficie3D,filas,columnas);
    
}

function dibujarGeometria(){

    dibujarMalla(mallaDeTriangulos);

}

function Plano(ancho,largo){

    this.getPosicion=function(u,v){

        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Esfera(radio){

    this.getPosicion=function(u,v){
        var theta = u*Math.PI*2;
        var phi = v*Math.PI;
        var x=(Math.cos(theta))*(Math.sin(phi))*radio;
        var y=(Math.sin(theta))*(Math.sin(phi))*radio;
        var z=Math.cos(phi)*radio;
        
        return [x,y,z];
    }

    this.getNormal=function(u,v){
        var p0 = this.getPosicion(u, v);
        var p1 = this.getPosicion(u+0.001, v);
        var p2 = this.getPosicion(u, v+0.001);
        var v1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        var v2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];

        var x = v1[1]*v2[2] - v1[2]*v2[1];
        var y = -(v1[0]*v2[2] - v1[2]*v2[0]);
        var z = v1[0]*v2[1] - v1[1]*v2[0];
        console.log([x,y,z]);
        return [x,y,z];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function TuboSenoidal(amp_onda, long_onda, radio, altura){

    this.getPosicion=function(u,v){
        var onda = amp_onda * Math.cos(2*Math.PI/long_onda * v);
        var theta = u*Math.PI*2;
        var x = Math.cos(theta) * (radio + onda);
        var y = v*altura - altura/2;
        var z = Math.sin(theta) * (radio + onda);
        
        return [x,y,z];
    }

    this.getNormal=function(u,v){
        var p0 = this.getPosicion(u, v);
        var p1 = this.getPosicion(u+0.001, v);
        var p2 = this.getPosicion(u, v+0.001);
        var v1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        var v2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];

        var x = v1[1]*v2[2] - v1[2]*v2[1];
        var y = -(v1[0]*v2[2] - v1[2]*v2[0]);
        var z = v1[0]*v2[1] - v1[1]*v2[0];

        return [x,y,z];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}


function indice(fila, columna, verticesPorFila){
    return fila*verticesPorFila + columna;
}

function generarSuperficie(superficie,filas,columnas){
    
    positionBuffer = [];
    normalBuffer = [];
    uvBuffer = [];

    for (var i=0; i <= filas; i++) {
        for (var j=0; j <= columnas; j++) {

            var u=j/columnas;
            var v=i/filas;

            var pos=superficie.getPosicion(u,v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm=superficie.getNormal(u,v);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uvs=superficie.getCoordenadasTextura(u,v);

            uvBuffer.push(uvs[0]);
            uvBuffer.push(uvs[1]);

        }
    }

    // Buffer de indices de los triángulos
    
    indexBuffer=[];  
    //indexBuffer=[0,1,2,2,1,3]; // Estos valores iniciales harcodeados solo dibujan 2 triangulos, REMOVER ESTA LINEA!

    for (i=0; i < filas; i++) {
        for (j=0; j <= columnas; j++) {
            indexBuffer.push(indice(i, j, columnas+1));
            indexBuffer.push(indice(i+1, j, columnas+1));
            if (j == columnas && i != filas-1){
                indexBuffer.push(indice(i+1, j, columnas+1));
                indexBuffer.push(indice(i+1, 0, columnas+1));
            }

            // completar la lógica necesaria para llenar el indexbuffer en funcion de filas y columnas
            // teniendo en cuenta que se va a dibujar todo el buffer con la primitiva "triangle_strip" 
            
        }
    }

    // Creación e Inicialización de los buffers

    webgl_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
    webgl_position_buffer.itemSize = 3;
    webgl_position_buffer.numItems = positionBuffer.length / 3;

    webgl_normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
    webgl_normal_buffer.itemSize = 3;
    webgl_normal_buffer.numItems = normalBuffer.length / 3;

    webgl_uvs_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    webgl_uvs_buffer.itemSize = 2;
    webgl_uvs_buffer.numItems = uvBuffer.length / 2;


    webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    webgl_index_buffer.itemSize = 1;
    webgl_index_buffer.numItems = indexBuffer.length;

    return {
        webgl_position_buffer,
        webgl_normal_buffer,
        webgl_uvs_buffer,
        webgl_index_buffer
    }
}

function dibujarMalla(mallaDeTriangulos){
    
    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
       
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);


    if (modo!="wireframe"){
        gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
        /*
            Aqui es necesario modificar la primitiva por triangle_strip
        */
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    
    if (modo!="smooth") {
        gl.uniform1i(shaderProgram.useLightingUniform,false);
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
 
}

