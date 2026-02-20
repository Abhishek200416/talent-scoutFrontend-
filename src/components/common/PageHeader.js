import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../ui/button';

export function PageHeader({ title, description, backTo }) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1); // Go back to previous page
    }
  };
  
  return (
    <div className="space-y-4 animate-slide-up">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4 hover:bg-primary/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div>
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {description && (
          <p className="text-xl text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
