"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Electronics",
    total: 540,
    lowStock: 15,
  },
  {
    name: "Furniture",
    total: 320,
    lowStock: 5,
  },
  {
    name: "Office",
    total: 720,
    lowStock: 12,
  },
  {
    name: "Kitchen",
    total: 350,
    lowStock: 8,
  },
  {
    name: "Clothing",
    total: 450,
    lowStock: 20,
  },
  {
    name: "Tools",
    total: 280,
    lowStock: 10,
  },
]

export function InventoryChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" name="Total Items" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="lowStock" name="Low Stock" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

