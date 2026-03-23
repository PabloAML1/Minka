import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workerName, role, dailyRate, daysWorked, projectId } = body;

    if (!workerName || !role || !dailyRate || !daysWorked || !projectId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const rate = Number(dailyRate);
    const days = Number(daysWorked);
    const totalCost = rate * days;

    const labor = await prisma.labor.create({
      data: {
        workerName,
        role,
        dailyRate: rate,
        daysWorked: days,
        totalCost,
        projectId
      }
    });

    return NextResponse.json(labor, { status: 201 });
  } catch (error: any) {
    console.error('Error creating labor record:', error);
    return NextResponse.json({ error: 'Error al registrar la cuadrilla' }, { status: 500 });
  }
}
