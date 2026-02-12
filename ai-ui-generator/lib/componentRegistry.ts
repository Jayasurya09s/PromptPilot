import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { Chart } from "@/components/ui/Chart";

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

export const allowedComponents = Object.keys(componentRegistry);
