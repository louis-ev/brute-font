/* sketch dérivé de http://www.openprocessing.org/sketch/101480 par Saúl Oviedo León */
/* modifications de Louis Eveillard */

ball[] mesballes =new ball[50];
color[] couleurs = {#31d1b5,#eea111,#d63e26,#4a73c7};

void setup() {

  noStroke();
  size( 1024, 800);
  frameRate(1);
  for (int i=0; i<mesballes.length; i++) {
  a = int(random(0, 4));
    color c= couleurs[a];
    float d=random(20, 50);
    mesballes[i] =new ball(c, d);
  }
}


//imprime en lla pantalla
void draw() {
  background(249);
  for (int i=0;i<mesballes.length;i++) {
    mesballes[i].run();
  }
}

class ball {
  //variables global
  PVector location;
  PVector velocity;
  PVector aceleracion;
  PVector mouse;
  PVector dir;
  color c;
  float diametro;
  float mass;
  float scalar=0.6;

  //constructor
  ball(color cl, float d) {
    c= cl;
    diametro=d;
    mass= d;
    location = new PVector(random(d,width-d), random(d,height-d));
    velocity = new PVector(random(-2,2), random(-2,2));
    aceleracion = new PVector(0,0);

  }

  //funcion
  void run() {
    PVector gravedad = new PVector(0,0.15*mass);

    float coef= map(diametro,20,50,0.1,0.8);
    PVector friccion = velocity.get();
    friccion.mult(-1);
    friccion.normalize();
    friccion.mult(coef);

    fondo();
    //applyForce(friccion);
    update();
    rebote();
  }

  void applyForce(PVector force){
	  PVector f = PVector.div(force,mass);
	  aceleracion.add(f);


  }

 void fondo() {

  stroke(c, int(abs(location.x-width/2))/1.7-50);

  if (!mousePressed)
  for (int j = 0; j<mesballes.length-1; j++){
    distballs = int(dist(location.x, location.y, mesballes[j].location.x, mesballes[j].location.y));
    if (distballs<70 && distballs>30){
      line(location.x, location.y, mesballes[j].location.x, mesballes[j].location.y);
    }
  }




    fill(c, int(abs(location.x-width/2))-300);
    ellipse(location.x, location.y, diametro, diametro);
 }


  void update() {
  	// bug de mouseY, qui se fait par rapport à la page ? étrange.
/*     mouse = new PVector(mouseX,mouseY); */
    mouse = new PVector(mouseX,mouseY);
    PVector dir = PVector.sub(mouse,location);
    dir.normalize();
  dir.mult(scalar);
  if(mousePressed){

      aceleracion.add(dir);

  }
  velocity.add(aceleracion);
    velocity.limit(10);
    location.add(velocity);
    aceleracion.mult(0.9);
  }



   void rebote() {
    if (location.x<diametro/2){
      velocity.x*= -1;
      location.x=diametro/2;
    }
      if (location.x>width-diametro/2) {
      velocity.x*= -1;
      location.x=width-diametro/2;
    }
     if (location.y<diametro/2) {
      velocity.y*= -1;
      location.y= diametro/2;
    }
     if (location.y>height-diametro/2) {
      velocity.y*= -1;
      location.y= height-diametro/2;
    }
  }

}

void updateSize (newWidth) {
  size(newWidth, 600);
}
