import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH - Update project (e.g. budget)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData: any = {};
    if (body.totalBudget !== undefined) updateData.totalBudget = Number(body.totalBudget);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.name !== undefined) updateData.name = body.name;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, id: project.id });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Error al actualizar el proyecto' }, { status: 500 });
  }
}
