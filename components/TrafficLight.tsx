'use client';
import React from "react";

export function TrafficLight({ status }: { status: 'GREEN'|'AMBER'|'RED' }) {
  const color = status === 'GREEN' ? 'bg-green-500' : status === 'AMBER' ? 'bg-yellow-500' : 'bg-red-500';
  return <span className={`inline-block w-3 h-3 rounded-full ${color}`} aria-label={`status ${status}`} />;
}
