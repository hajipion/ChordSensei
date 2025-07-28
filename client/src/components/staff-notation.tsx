import { type ChordData } from "@shared/schema";
import { generateStaffNotation } from "@/lib/staff-generator";

interface StaffNotationProps {
  chord: ChordData;
  className?: string;
}

export function StaffNotation({ chord, className }: StaffNotationProps) {
  const svgContent = generateStaffNotation(chord);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
