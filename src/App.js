import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const units = {
  Temperature: '℃',
  Humidity: '%',
}

function chunk(arrayBuffer, size) {
  const chunks = [];

  for (let i = 0; i < arrayBuffer.byteLength; i += size) {
    chunks.push(arrayBuffer.slice(i, i + size));
  }

  return chunks;
};

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/data');
      const binaryData = await response.arrayBuffer();

      // Our data format is [timestamp][tempreature][humidity][timestamp][tempreature][humidity][timestamp]...
      // The timestamp is a 32 bit (4 bytes) integer and temprature and humidity are 32 bit (4 bytes) floats.
      // We first split the whole data to 12 byte chunks of [timestamp][tempreature][humidity].
      // The we split that to three 4 bit chunks and convert the binary data to numbers.
      const chunks = chunk(binaryData, 12).map((c) => chunk(c, 4)).map((logLine) => ({
        timestamp: new DataView(logLine[0]).getInt32(0, true) * 1000,
        Temperature: new DataView(logLine[1]).getFloat32(0, true),
        Humidity: new DataView(logLine[2]).getFloat32(0, true)
      }));

      setData(chunks);
    }

    fetchData();
  }, []);

  return (
    <div style={{ height: "400px" }}>
      <ResponsiveContainer>
        <LineChart data={data} >
          <XAxis
            dataKey="timestamp"
            interval="preserveStartEnd"
            type={"number"}
            domain={['dataMin', 'dataMax']}
            tickCount={3}
            tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
            strokeWidth={2}
          />
          <YAxis yAxisId="left" strokeWidth={2} />
          <YAxis yAxisId="right" orientation="right" strokeWidth={2} />
          <Tooltip
            formatter={(value, name) => `${value.toFixed(2)} ${units[name]}`}
            labelFormatter={(ts) => new Date(ts).toLocaleString()}
            name="foo"
          />
          <Line
            yAxisId={"left"}
            dot={false}
            type="monotone"
            dataKey={"Temperature"}
            stroke={"#EC9A29"}
            strokeWidth={2}
            label="Unique Visitors"
          />
          <Line
            yAxisId={"right"}
            dot={false}
            type="monotone"
            dataKey={"Humidity"}
            stroke={"#A8201A"}
            strokeWidth={2}
            label="Unique Visitors"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
