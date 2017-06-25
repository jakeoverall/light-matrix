/*
ColorMatrixStreamer.ino
This program is designed to control an Adafruit DotStar 16x16 LED Matrix
Data is expected to be streamed down the Serial USB line, in RGB byte format.
Once a full set of 768 bytes are received, the data is automatically displayed.
*/

#include "colorStruct.h"
#include <SPI.h>
/* IF Using SPI mode instead of ShiftOut()
** Clock pin is 13
** Data pin is 11
** Uncomment the defines
** and pinMode() statements
*/

//#define DATAPIN 4
//#define CLOCKPIN 5

bool TESTMODE = false; //Make this true to test matrix
bool VERBOSE = false; //Verbose debug

//Pre-defined colors
const color BLACK = {0, 0, 0};
const color WHITE = {128, 128, 128};
const color RED = {128, 0 , 0};
const color GREEN = {0, 128 , 0};
const color BLUE = {0, 0, 128};

//Global color array
#define MATRIXSIZE 256
color COLORMATRIX[MATRIXSIZE];

//Global Byte counter
uint16_t BYTECOUNT = 0;
uint16_t COLORINDEX = 0;

void setup()
{
  //pinMode(DATAPIN, OUTPUT);
  //pinMode(CLOCKPIN, OUTPUT);
  
  SPI.begin();
  Serial.begin(115200);
  Serial.println("ColorMatrixStreamer");
  Serial.println("Clearing Matrix...");
  clearColorMatrix();
  drawColorMatrix();
  delay(1000);
  Serial.println("Ready");
  
  if(VERBOSE) Serial.println("Verbose Debug ON");
  
  if(TESTMODE)
  {
   Serial.println("TestMode ON");
   while(true)
   {
     chaserTest();
     //randomTest();
     //fastTest();
   } 
  } 
}


void loop()
{
  if(Serial.available() > 0)
  {
    int incomingByte = Serial.read();
    if(incomingByte < 0 || incomingByte > 255)
    {
      Serial.println("Bad data received");
      return; 
    }
    else
    {
      if(incomingByte = 255) incomingByte = 254; //No full value to prevent premature display of lights (due to protocol)
      switch(BYTECOUNT)
      {
       case 0:
        COLORMATRIX[COLORINDEX].r =  byte(incomingByte);
        break;
        
       case 1:
        COLORMATRIX[COLORINDEX].g =  byte(incomingByte);
        break;
        
       case 2:
        COLORMATRIX[COLORINDEX].b =  byte(incomingByte);
        break;
      }
      BYTECOUNT++;
      
      if(BYTECOUNT >= 3){
        BYTECOUNT = 0;
        COLORINDEX++;
      }
      if(COLORINDEX > MATRIXSIZE)
      {
        COLORINDEX = 0;
        drawColorMatrix();
      }
    }
  }
}

void printColorMatrix()
{
 Serial.println("ColorMatrix:");
  for(int i = 0; i < MATRIXSIZE; i++)
  {
    Serial.print(COLORMATRIX[i].r);
    Serial.print(',');
    Serial.print(COLORMATRIX[i].g);
    Serial.print(',');
    Serial.print(COLORMATRIX[i].b);
    Serial.print(';');
  } 
}

void clearColorMatrix()
{
  for(int i = 0; i < MATRIXSIZE; i++)
  {
    COLORMATRIX[i] = BLACK;
  }
  return;
}

void drawColorMatrix()
{
  //if(VERBOSE){ Serial.println("Drawing"); printColorMatrix(); }
  shiftMutiple(0x00, 16);
  for(int i = 0; i < MATRIXSIZE; i++)
  {
    shiftPixel(COLORMATRIX[i]);
  }
  shiftMutiple(0x00, 16);
  return;
}

void shiftMutiple(byte b, int count)
{
  for(int i = 0; i < count; i++)
  {
    //shiftOut(DATAPIN, CLOCKPIN, MSBFIRST, b);
    SPI.transfer(b);
  }
}

void shiftPixel(color data)
{
  //shiftOut(DATAPIN, CLOCKPIN, MSBFIRST, 0xff);  
  //shiftOut(DATAPIN, CLOCKPIN, MSBFIRST, data.r);  
  //shiftOut(DATAPIN, CLOCKPIN, MSBFIRST, data.g);  
  //shiftOut(DATAPIN, CLOCKPIN, MSBFIRST, data.b); 
  SPI.transfer(0xff);
  SPI.transfer(data.b);
  SPI.transfer(data.g);
  SPI.transfer(data.r);
   
  return;  
}

void randomTest()
{
  for(int i = 0; i < MATRIXSIZE; i++)
  {
   COLORMATRIX[i].r = random(0, 8); //Limit birghtness to 64 
   COLORMATRIX[i].g = random(0, 8); //Limit birghtness to 64 
   COLORMATRIX[i].b = random(0, 8); //Limit birghtness to 64 
  }
  drawColorMatrix();
  //if(VERBOSE) {printColorMatrix();}
}

void chaserTest()
{
  for(int i = 0; i < MATRIXSIZE; i++)
  {
    clearColorMatrix();
    COLORMATRIX[i] = RED;
    drawColorMatrix();
  }
}

void fastTest()
{
  for(int y = 1; y <= 16; y++)
  {
    for(int i = 0; i < y*16; i++)
    {
     COLORMATRIX[i] = RED; 
    }
    drawColorMatrix();
  }
  clearColorMatrix();
}





