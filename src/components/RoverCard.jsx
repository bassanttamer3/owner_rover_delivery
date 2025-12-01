import React from 'react';
import { Battery, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const RoverCard = ({ rover, onClick, isSelected }) => {
  const statusConfig = {
    active: { label: 'Active', className: 'bg-success text-success-foreground' },
    idle: { label: 'Idle', className: 'bg-warning text-warning-foreground' },
    problem: { label: 'Problem', className: 'bg-destructive text-destructive-foreground' },
  };

  const status = statusConfig[rover.status];

  const getBatteryColor = (battery) => {
    if (battery > 60) return 'text-success';
    if (battery > 30) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary shadow-md'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{rover.name}</h3>
            <p className="text-xs text-muted-foreground">{rover.id}</p>
          </div>
          <Badge className={status.className}>{status.label}</Badge>
        </div>

        <div className="space-y-2.5">
          {/* Battery */}
          <div className="flex items-center gap-2">
            <Battery className={cn('w-4 h-4', getBatteryColor(rover.battery))} />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Battery</span>
                <span className={cn('text-xs font-medium', getBatteryColor(rover.battery))}>
                  {rover.battery}%
                </span>
              </div>
              <Progress value={rover.battery} className="h-1.5" />
            </div>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Speed:</span>
            <span className="font-medium text-foreground">{rover.speed} mph</span>
          </div>

          {/* Current Order */}
          {rover.currentOrder && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Order:</span>
              <span className="font-medium text-foreground">{rover.currentOrder}</span>
            </div>
          )}

          {/* Last Update */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
            <Clock className="w-3 h-3" />
            <span>Updated {new Date(rover.lastUpdate).toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoverCard;
