import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.totalBudget) {
      return NextResponse.json({ error: 'Nombre y presupuesto son obligatorios' }, { status: 400 });
    }

    const maxBudget = Number(body.totalBudget);

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description || null,
        address: body.address || null,
        totalBudget: maxBudget,
        clientName: body.clientName || null,
        maestroName: body.maestroName || null,
        status: 'PLANNING',
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
