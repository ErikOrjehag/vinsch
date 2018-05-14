#include <Encoder.h>

Encoder ecoder(2, 3);

void setup() {
  Serial.begin(9600);
}

long oldPosition  = -999;

void loop() {
  long newPosition = ecoder.read();
  if (newPosition != oldPosition) {
    oldPosition = newPosition;
    Serial.println(newPosition);
  }
}
