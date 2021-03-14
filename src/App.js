import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const units = {
  Temperature: '℃',
  Humidity: '%',
}

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/data');
      const buffer = await response.arrayBuffer();
      const view = new DataView(buffer);

      // Our data format is [timestamp][tempreature][humidity][timestamp][tempreature][humidity][timestamp]...
      // The timestamp is a 32 bit (4 bytes) integer and temprature and humidity are 32 bit (4 bytes) floats.
      // We loop over the data in 12 byte steps and convert the binary data to numbers.
      const data = [];

      for (let i = 0; i < buffer.byteLength; i += 12) {
        data.push({
          timestamp: view.getInt32(i, true) * 1000,
          Temperature: view.getFloat32(i + 4, true),
          Humidity: view.getFloat32(i + 8, true)
        })
      }

      setData(data);
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
          />
          <Line
            yAxisId={"right"}
            dot={false}
            type="monotone"
            dataKey={"Humidity"}
            stroke={"#A8201A"}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
