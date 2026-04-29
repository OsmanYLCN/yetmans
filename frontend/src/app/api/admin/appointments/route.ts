import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/utils/supabase-admin';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const supabaseServer = await createClient()
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Fetch appointments with service details
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      first_name,
      last_name,
      phone,
      date,
      time,
      status,
      created_at,
      service_id,
      services:service_id (
        id,
        name,
        price
      )
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Format the response to map Django's `service` foreign key nested representation
  const formattedData = data.map(item => {
    return {
      ...item,
      service: item.services // map `services` relation to `service`
    };
  });
  
  return NextResponse.json(formattedData);
}

export async function PATCH(request: Request) {
  const supabaseServer = await createClient()
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: "ID and Status required" }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select();
      
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabaseServer = await createClient()
  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // admin yetkisiyle satırı kökten siliyoruz
    const { error } = await supabase.from('appointments').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}