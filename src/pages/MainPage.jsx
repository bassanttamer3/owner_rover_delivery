import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MapPanel from '@/components/MapPanel';
import mockRovers from '@/data/mockRovers.json';
import { useApp } from '@/contexts/AppContext';
import { Truck, Package, MapPin, Activity, ArrowRight, Users } from 'lucide-react';

const MainPage = () => {
  const [selectedRover, setSelectedRover] = useState(null);
  const navigate = useNavigate();
  const { setSelectedRover: setGlobalRover } = useApp();

  const handleMarkerClick = (rover) => {
    setSelectedRover(rover);
  };

  const handleViewOnTracking = () => {
    setGlobalRover(selectedRover);
    navigate('/live-tracking');
  };

  const overviewBoxes = [
    {
      icon: Truck,
      title: 'Rovers Overview',
      description: 'Manage your entire delivery fleet',
      stats: `${mockRovers.length} Total Rovers`,
      route: '/rovers',
      color: 'primary',
    },
    {
      icon: Package,
      title: 'Orders Summary',
      description: 'Track all active deliveries',
      stats: `${mockRovers.filter((r) => r.currentOrder).length} Active Orders`,
      route: '/orders',
      color: 'primary',
    },
    {
      icon: MapPin,
      title: 'Live Tracking',
      description: 'Real-time rover location monitoring',
      stats: `${mockRovers.filter((r) => r.status === 'active').length} Active Rovers`,
      route: '/live-tracking',
      color: 'success',
    },
    {
      icon: Activity,
      title: 'Activity Logs',
      description: 'View complete fleet activity history',
      stats: 'Real-time updates',
      route: '/activity-logs',
      color: 'primary',
    },
  ];

  const teamMembers = [
    { name: 'Bassant Tamer', role: 'Team Member' },
    { name: 'Habiba Mohamed', role: 'Team Member' },
    { name: 'Salma Osama', role: 'Team Member' },
    { name: 'Omar Hassan', role: 'Team Member' },
    { name: 'Ahmed Fayad', role: 'Team Member' },
    { name: 'Mohammed Abdullah', role: 'Team Member' },
    { name: 'Hassan Elzayat', role: 'Team Member' },
    { name: 'Karim Salah', role: 'Team Member' },
    { name: 'Menna Essam', role: 'Team Member' },
    { name: 'Mahmoud Galal', role: 'Team Member' },
    { name: 'Peter Ashraf', role: 'Team Member' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section with Map */}
      <section className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-background flex gap-6">
  {/* Map */}
  <div className="flex-1 rounded-2xl overflow-hidden">
    <MapPanel rovers={mockRovers} selectedRover={null} onMarkerClick={() => {}} />
  </div>

  {/* Sidebar Fixed Card */}
  <div className="w-80 space-y-4">
    {mockRovers.map((rover) => (
      <Card key={rover.id} className="p-4">
        <h3 className="text-lg font-bold">{rover.name}</h3>
        <p className="text-sm text-muted-foreground">{rover.id}</p>

        <Badge
          className={`${
            rover.status === 'active'
              ? 'bg-success text-success-foreground'
              : rover.status === 'idle'
              ? 'bg-warning text-warning-foreground'
              : 'bg-destructive text-destructive-foreground'
          } my-2`}
        >
          {rover.status.toUpperCase()}
        </Badge>

        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Battery</span>
            <span className="font-bold text-foreground">{rover.battery}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${rover.battery}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Speed</span>
            <span className="font-bold text-foreground">{rover.speed || 0} mph</span>
          </div>

          {rover.currentOrder && (
            <div className="mt-1">
              <span className="text-sm text-muted-foreground">Order</span>
              <p className="font-medium text-foreground">{rover.currentOrder}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            Updated {new Date(rover.lastUpdate).toLocaleTimeString()}
          </p>
        </div>
      </Card>
    ))}
  </div>
</section>


      {/* Feature Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewBoxes.map((box, index) => {
          const Icon = box.icon;
          return (
            <Card
              key={index}
              className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-background to-primary/5"
              onClick={() => navigate(box.route)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{box.title}</h3>
                  <p className="text-sm text-muted-foreground">{box.description}</p>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-primary">{box.stats}</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground group-hover:shadow-md transition-all"
                >
                  Show More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* About Us Section */}
      <section className="space-y-8 pt-8">
        {/* Intro Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-8 h-8 text-primary" />
            <h2 className="text-4xl font-bold text-foreground">About Our Team</h2>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are the Owner Rover Delivery Team, dedicated to revolutionizing autonomous delivery
            systems. Our team combines expertise in robotics, software engineering, and logistics to
            create efficient, reliable, and innovative delivery solutions for the modern world.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-background to-primary/5"
            >
              <CardContent className="p-6 text-center space-y-4">
                {/* Photo Placeholder */}
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-4 border-primary/30 group-hover:border-primary/60 transition-all duration-300 group-hover:scale-110">
                  <Users className="w-12 h-12 text-primary" />
                </div>

                {/* Name and Role */}
                <div>
                  <h4 className="font-bold text-foreground text-lg">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>

                {/* Green Bottom Line */}
                <div className="w-16 h-1 bg-primary rounded-full mx-auto group-hover:w-full transition-all duration-300"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainPage;
