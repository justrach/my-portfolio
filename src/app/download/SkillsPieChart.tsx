'use client'

import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface Skill {
    name: string;
    percent: number;
    color: string;
  }
  
  const SkillsPieChart = ({ skills }: { skills: Skill[] }) => {
    // Filter skills to include only those with a percentage > 0
    const filteredSkills = skills.filter(skill => skill.percent > 0);
  
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <PieChart width={300} height={300}>
            <Pie
              data={filteredSkills}
              cx={150}
              cy={150}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="percent"
            >
              {filteredSkills.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [`${value.toFixed(2)}%`, props.payload.name]}
              labelFormatter={() => ''}
            />
          </PieChart>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsPieChart;