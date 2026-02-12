/**
 * Component Registry
 * 
 * Central registry of all UI components available for AI-generated interfaces.
 * This ensures only safe, pre-approved components can be used in generated UIs.
 * 
 * @module componentRegistry
 */

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { Chart } from "@/components/ui/Chart";

/**
 * Registry mapping component names to their React components.
 * Used by PreviewRenderer to dynamically render components.
 */
export const componentRegistry = {
  Button,
  Card,
  Navbar,
  Sidebar,
  Input,
  Modal,
  Table,
  Chart,
};

/**
 * Array of allowed component type names.
 * Used for validation to ensure only registered components are generated.
 */
export const allowedComponents = Object.keys(componentRegistry);
