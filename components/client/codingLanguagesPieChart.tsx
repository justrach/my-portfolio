"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart, Sector, Tooltip } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const codingLanguagesData = {"data":[{"color":"#3178c6","name":"TypeScript","percent":35.77},{"color":"#00B4AB","name":"Dart","percent":19.68},{"color":"#f1e05a","name":"JavaScript","percent":19.3},{"color":"#3572A5","name":"Python","percent":9.17},{"color":"#292929","name":"JSON","percent":2.7},{"color":"#cb171e","name":"YAML","percent":2.55},{"color":"#dea584","name":"Rust","percent":2.47},{"color":"#16ce40","name":"Other","percent":1.47},{"color":"#dc9658","name":"Bash","percent":1.37},{"color":"#d62728","name":"Text","percent":0.71},{"color":"#083fa1","name":"Markdown","percent":0.48},{"color":"#f34b7d","name":"C++","percent":0.47},{"color":"#9467bd","name":"Docker","percent":0.43},{"color":"#237346","name":"CSV","percent":0.31},{"color":"#0c344b","name":"Prisma","percent":0.29},{"color":"#8c564b","name":"Ezhil","percent":0.27},{"color":"#fcb32c","name":"MDX","percent":0.25},{"color":"#9c4221","name":"TOML","percent":0.23},{"color":"#563d7c","name":"CSS","percent":0.23},{"color":"#355570","name":"GDScript","percent":0.23},{"color":"#0060ac","name":"XML","percent":0.21},{"color":"#00ADD8","name":"Go","percent":0.2},{"color":"#F05138","name":"Swift","percent":0.17},{"color":"#aec7e8","name":"SSH Config","percent":0.17},{"color":"#F44D27","name":"Git Config","percent":0.17},{"color":"#e377c2","name":"textmate","percent":0.12},{"color":"#f7b6d2","name":"TSConfig","percent":0.09},{"color":"#4298b8","name":"Groovy","percent":0.08},{"color":"#e34c26","name":"HTML","percent":0.06},{"color":"#7f7f7f","name":"Properties","percent":0.04},{"color":"#c7c7c7","name":"GDScript3","percent":0.04},{"color":"#e38c00","name":"SQL","percent":0.04},{"color":"#b07219","name":"Java","percent":0.03},{"color":"#bcbd22","name":".env file","percent":0.02},{"color":"#438eff","name":"Objective-C","percent":0.02},{"color":"#c065db","name":"Emacs Lisp","percent":0.02},{"color":"#ff3e00","name":"Svelte","percent":0.02},{"color":"#dbdb8d","name":"GitIgnore file","percent":0.02},{"color":"#02303a","name":"Gradle","percent":0.02},{"color":"#17becf","name":"Shell Script","percent":0.01},{"color":"#9edae5","name":"Image (svg)","percent":0.01},{"color":"#ffbb78","name":"Protocol Buffer","percent":0.01},{"color":"#98df8a","name":"Git","percent":0.01},{"color":"#ff9896","name":"MySQL","percent":0.01},{"color":"#c5b0d5","name":"CSV/TSV","percent":0.01},{"color":"#555555","name":"C","percent":0},{"color":"#e38c00","name":"TSQL","percent":0},{"color":"#c6538c","name":"SCSS","percent":0},{"color":"#d1dbe0","name":"INI","percent":0},{"color":"#c49c94","name":"Arduino","percent":0},{"color":"#882B0F","name":"ActionScript","percent":0},{"color":"#A97BFF","name":"Kotlin","percent":0},{"color":"#16ce40","name":"LESS","percent":0},{"color":"#6E4C13","name":"Assembly","percent":0},{"color":"#dc9658","name":"SSH Key","percent":0},{"color":"#d62728","name":"tsconfig","percent":0},{"color":"#9467bd","name":"Jupyter","percent":0},{"color":"#8c564b","name":"IDEA_MODULE","percent":0},{"color":"#2A6277","name":"Java Properties","percent":0},{"color":"#DA3434","name":"CMake","percent":0},{"color":"#aec7e8","name":"Jade","percent":0},{"color":"#009639","name":"Nginx","percent":0},{"color":"#e377c2","name":"Cocoa","percent":0},{"color":"#a91e50","name":"EJS","percent":0}]}

export function CodingLanguagesPieChart() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const topLanguages = codingLanguagesData.data.slice(0, 10);  // Top 10 languages

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setHoveredIndex(index);
    },
    [setHoveredIndex]
  );

  const onPieLeave = React.useCallback(() => {
    setHoveredIndex(null);
  }, [setHoveredIndex]);

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value.toFixed(2)}%`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
      <CardTitle>Coding Languages Proficiency{'<Live from Wakatime>'}</CardTitle>
<CardDescription>Based on usage percentage (Top 10 shown in chart)</CardDescription></CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <PieChart width={400} height={400}>
            <Pie
              activeIndex={hoveredIndex !== null ? hoveredIndex : activeIndex}
              activeShape={renderActiveShape}
              data={topLanguages}
              cx={200}
              cy={200}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="percent"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {topLanguages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          <div className="mt-4 md:mt-0">
            <h3 className="text-lg font-semibold mb-2">All Languages</h3>
            <div className="max-h-80 overflow-y-auto">
              {codingLanguagesData.data.map((lang, index) => (
                <div key={index} className="flex items-center mb-1">
                  <div
                    className="w-3 h-3 mr-2 rounded-full"
                    style={{ backgroundColor: lang.color }}
                  ></div>
                  <span className="mr-2">{lang.name}:</span>
                  <span className="font-semibold">{lang.percent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}