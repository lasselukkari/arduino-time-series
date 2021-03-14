#if defined(ESP8266)
#include <ESP8266WiFi.h>
#include <FS.h>
#else
#include <WiFi.h>
#include <SPIFFS.h>
#endif

#include <WiFiUdp.h>
#include <NTPClient.h>
#include <aWOT.h>

#define WIFI_SSID ""
#define WIFI_PASSWORD ""
#define DATA_FILE "/data.bin"

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);
WiFiServer server(80);
Application app;

void getData(Request &req, Response &res) {
  File file = SPIFFS.open(DATA_FILE, "r");
  if (!file) {
    return res.sendStatus(500);
  }

  res.set("Content-Type", "application/binary");

  while (file.available()) {
    res.write(file.read());
  }
}

// SPIFFS file system is used instead of SD card. The api is the same but we need to do less setup.
void storeMeasurement(uint32_t epoch, float temperature, float humidity) {
  File file = SPIFFS.open(DATA_FILE, "a");
  if (!file) {
    Serial.println("Failed to open file for appending");
    return;
  }

  file.write((byte *)&epoch, 4);
  file.write((byte *)&temperature, 4);
  file.write((byte *)&humidity, 4);

  file.close();

  Serial.println("data written");
}



void setup() {
  Serial.begin(115200);
  SPIFFS.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.localIP());


  app.get("/api/data", &getData);
  server.begin();

  timeClient.begin();
  timeClient.update();

  // create a new faked measurement when the device is resetted
  storeMeasurement(timeClient.getEpochTime(), 20.5, 58.7);
}

void loop() {
  WiFiClient client = server.available();

  if (client.connected()) {
    app.process(&client);
  }
}
