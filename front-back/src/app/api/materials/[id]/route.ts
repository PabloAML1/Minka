import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH - Update material
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.quantity !== undefined) updateData.quantity = Number(body.quantity);
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.unitPrice !== undefined) updateData.unitPrice = Number(body.unitPrice);
    if (body.status !== undefined) updateData.status = body.status;

    // Auto-recalculate totalPrice if quantity or unitPrice changed
    if (body.quantity !== undefined || body.unitPrice !== undefined) {
      const current = await prisma.material.findUnique({ where: { id } });
      if (!current) return NextResponse.json({ error: 'Material no encontrado' }, { status: 404 });
      const qty = body.quantity !== undefined ? Number(body.quantity) : current.quantity;
      const price = body.unitPrice !== undefined ? Number(body.unitPrice) : Number(current.unitPrice);
      updateData.totalPrice = qty * price;
    }

    const material = await prisma.material.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, id: material.id });
  } catch (error: any) {
    console.error('Error updating material:', error);
    return NextResponse.json({ error: 'Error al actualizar el suministro' }, { status: 500 });
  }
}

// DELETE - Remove material
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.material.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ error: 'Error al eliminar el suministro' }, { status: 500 });
  }
}
