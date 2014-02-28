int diametre = 4;
int vitesseMarche = 10;
int posX = 200, posY = 200;
int direction = 0;

// directions possibles
int NORD = 0;
int NORDEST = 1;
int EST = 2;
int SUDEST = 3;
int SUD = 4;
int SUDOUEST = 5;
int OUEST = 6;
int NORDOUEST = 7;


void setup() {
  size(800, 800);
  noStroke();
  background(0);
  noLoop();
}

void draw() {

  fill(255);
  noStroke();
  rect( 0,0, width, height);

  for (int i=0; i<500; i++) {

    int pposX = posX;
    int pposY = posY;

    direction = (int) random(0, 8);

    if (direction == NORD) {
      posY -= vitesseMarche;
    }
    if (direction == NORDEST) {
      posX += vitesseMarche;
      posY -= vitesseMarche;
    }
    if (direction == EST) {
      posX += vitesseMarche;
    }
    if (direction == SUDEST) {
      posX += vitesseMarche;
      posY += vitesseMarche;
    }
    if (direction == SUD) {
      posY += vitesseMarche;
    }
    if (direction == SUDOUEST) {
      posX -= vitesseMarche;
      posY += vitesseMarche;
    }
    if (direction == OUEST) {
      posX -= vitesseMarche;
    }
    if (direction == NORDOUEST) {
      posX -= vitesseMarche;
      posY -= vitesseMarche;
    }

    if (posX<0) posX = width;
    if (posX>width) posX = 0;
    if (posY<0) posY = height;
    if (posY>height) posY = 0;

    fill(0);
    noStroke();
    diametre = 4;

/*
    if ( brightness(get(posX, posY)) > 50) {
      posX = pposX;
      posY = pposY;
      fill(#FFA032, 50);
      diametre = 10;
    }
*/

    ellipse( posX, posY, diametre, diametre );

	stroke(0);
	line(pposX, pposY, posX, posY);


  }
}

void keyReleased() {
  background(0);
}

void nextFrame() {
	draw();
}