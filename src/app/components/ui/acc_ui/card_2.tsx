// // components/AIResponseCard.tsx
// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface AIResponseCardProps {
//   data: {
//     role: string;
//     content: string;
//   };
// }

// export const AIResponseCard = React.memo(({ data }: AIResponseCardProps) => {
//     return (
//     <Card className="w-[300px] max-w-md mx-auto">
//       <CardHeader>
//         <CardTitle>{data.role === 'user' ? 'You' : 'AI'}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p>{data.content}</p>
//       </CardContent>
//     </Card>
//   );
// });

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIResponseCardProps {
  data: {
    role: string;
    content: string;
  };
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({ data }) => {
  return (
    <Card className="w-[300px] max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{data.role === 'user' ? 'You' : 'AI'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{data.content}</p>
      </CardContent>
    </Card>
  );
};