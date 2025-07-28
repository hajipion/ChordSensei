import { type ChordData } from "@shared/schema";
import { generateStaffNotation } from "@/lib/staff-generator";
import { useEffect } from "react";

interface StaffNotationProps {
  chord: ChordData;
  className?: string;
}

export function StaffNotation({ chord, className }: StaffNotationProps) {
  const htmlContent = generateStaffNotation(chord);
  
  // Re-render when chord changes to ensure abcjs renders properly
  useEffect(() => {
    // The generateStaffNotation function handles the rendering internally
  }, [chord]);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
