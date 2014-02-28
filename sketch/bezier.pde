int _width = 89;
int _height = 118;

// page = 886 / 1181px

float x1 = 0;
float y1 = 0;
float x2 = random (_width);
float y2 = random (_height);
float x3 = random (_width);
float y3 = random (_height);
float x4 = random (_width);
float y4 = random (_height);
int frame;

int decalageX = -5;
int decalageY = +5;

int traces = 4;

void setup() {
  size(_width, _height);
  background(255);
  noLoop();
  noStroke();
  fill(0);
}

void draw() {

	for (int i = 0; i<traces; i++) {
		x1 = x4;
		y1 = y4;
		x2 = random (_width);
		y2 = random (_height);
		x3 = random (_width);
		y3 = random (_height);
		x4 = random (_width);
		y4 = random (_height);


		beginShape();
		vertex(x1,y1);
		bezierVertex(x2, y2, x3, y3, x4, y4);
		vertex(x4 + decalageX, y4 + decalageY);
		bezierVertex(x3 + decalageX, y3 + decalageY, x2 + decalageX, y2 + decalageY, x1 + decalageX, y1 + decalageY);
		endShape(CLOSE);
	}
}

void cleanSlate() {
	background(255);
	draw();
}

void setTraces(int value) {
	traces = value;
}