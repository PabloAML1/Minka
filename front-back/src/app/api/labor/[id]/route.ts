import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH - Update labor record
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.workerName !== undefined) updateData.workerName = body.workerName;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.dailyRate !== undefined) updateData.dailyRate = Number(body.dailyRate);
    if (body.daysWorked !== undefined) updateData.daysWorked = Number(body.daysWorked);

    // Auto-recalculate totalCost
    if (body.dailyRate !== undefined || body.daysWorked !== undefined) {
      const current = await prisma.labor.findUnique({ where: { id } });
      if (!current) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
      const rate = body.dailyRate !== undefined ? Number(body.dailyRate) : Number(current.dailyRate);
      const days = body.daysWorked !== undefined ? Number(body.daysWorked) : current.daysWorked;
      updateData.totalCost = rate * days;
    }

    const labor = await prisma.labor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, id: labor.id });
  } catch (error: any) {
    console.error('Error updating labor:', error);
    return NextResponse.json({ error: 'Error al actualizar el registro' }, { status: 500 });
  }
}

// DELETE - Remove labor record
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.labor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting labor:', error);
    return NextResponse.json({ error: 'Error al eliminar el registro' }, { status: 500 });
  }
}
