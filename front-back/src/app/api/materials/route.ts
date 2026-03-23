import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, quantity, unit, unitPrice, status, projectId } = body;

    if (!name || !quantity || !unitPrice || !projectId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const qty = Number(quantity);
    const price = Number(unitPrice);
    const totalPrice = qty * price;

    const material = await prisma.material.create({
      data: {
        name,
        quantity: qty,
        unit: unit || 'unidad',
        unitPrice: price,
        totalPrice,
        status: status || 'PENDING',
        projectId
      }
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Error al registrar el suministro' }, { status: 500 });
  }
}
