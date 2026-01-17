import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export async function POST(request: NextRequest) {
  // Check for admin secret
  const authHeader = request.headers.get('x-admin-secret');
  if (authHeader !== 'cspace-import-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const results: string[] = [];

    // 1. Create legal_entities table
    const { error: createLegalEntitiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS legal_entities (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          short_name TEXT,
          inn TEXT,
          address TEXT,
          bank_name TEXT,
          bank_account TEXT,
          mfo TEXT,
          oked TEXT,
          nds_code TEXT,
          director_name TEXT,
          director_employee_id UUID,
          branch_id TEXT,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Try direct insert if RPC doesn't work
    // Create legal_entities table using raw SQL via Supabase

    // 2. Create employee_wages table
    const { error: createWagesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS employee_wages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID,
          legal_entity_id TEXT,
          wage_amount DECIMAL(12, 2) NOT NULL,
          wage_type TEXT DEFAULT 'official',
          notes TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(employee_id, legal_entity_id, wage_type)
        );
      `
    });

    // 3. Insert new branches
    const newBranches = [
      { id: 'hq', name: 'C-Space Headquarters', address: 'Chust Street 1, Mirzo-Ulugbek District, Tashkent', latitude: 41.2989, longitude: 69.2432, geofence_radius: 100 },
      { id: 'park', name: 'C-Space Park', address: 'Dormon Yoli Street 1, Mirzo-Ulugbek District, Tashkent', latitude: 41.345299, longitude: 69.328457, geofence_radius: 100 },
      { id: 'newport', name: 'C-Space Newport', address: 'Chust Street 1, Mirzo-Ulugbek District, Tashkent', latitude: 41.2989, longitude: 69.2432, geofence_radius: 100 },
      { id: 'fargona', name: 'C-Space Fargona', address: 'Shukrona Street 30, Fergana City', latitude: 40.38962, longitude: 71.774336, geofence_radius: 100 },
      { id: 'orient', name: 'C-Space Orient', address: 'Chust Street 1, Mirzo-Ulugbek District, Tashkent', latitude: 41.2989, longitude: 69.2432, geofence_radius: 100 },
    ];

    for (const branch of newBranches) {
      const { error } = await supabase
        .from('branches')
        .upsert(branch, { onConflict: 'id' });
      if (error) {
        results.push(`Branch ${branch.id}: ${error.message}`);
      } else {
        results.push(`Branch ${branch.id}: OK`);
      }
    }

    // 4. Insert legal entities
    const legalEntities = [
      { id: 'cspace-hq', name: 'ООО «C-SPACE»', short_name: 'C-SPACE', inn: '306326585', address: 'г.Ташкент, Мирзо-Улугбекский район, улица Чуст, дом 1', bank_name: 'АTБ «КАПИТАЛБАНК» г.Ташкент', bank_account: '2020 8000 0050 5977 9001', mfo: '01088', oked: '70220', nds_code: '326020139515', director_name: 'Ходиев Д. Б.', branch_id: 'hq' },
      { id: 'cs-labzak', name: 'ООО «CS LABZAK»', short_name: 'CS LABZAK', inn: '308508824', address: 'г.Ташкент, Шайхантахурский район, улица Лабзак, 64-а', bank_name: 'АTБ «КАПИТАЛБАНК» г.Ташкент', bank_account: '2020 8000 5053 9243 8001', mfo: '01088', oked: '70220', director_name: 'Абдурахмонов З.', branch_id: 'labzak' },
      { id: 'cspace-yunusabad', name: 'ООО «C-SPACE YUNUSABAD»', short_name: 'C-SPACE YUNUSABAD', inn: '309049682', address: 'г.Ташкент, Юнусобадский район, квартал 12, улица Ахмада дониша, дом 20А', bank_name: '«КАПИТАЛБАНК» г.Ташкент', bank_account: '2020 8000 9054 6143 4001', mfo: '01088', oked: '70220', director_name: 'Юсупов Р.Ё.', branch_id: 'yunusabad' },
      { id: 'cs-yunus-obod', name: 'ООО «CS YUNUS-OBOD»', short_name: 'CS YUNUS-OBOD', inn: '310121801', address: 'г.Ташкент, Юнусабадский район, квартал 12, улица Ахмада дониша, дом 20А', bank_name: '«Капиталбанк» г. Ташкент', bank_account: '2020 8000 3055 9992 5001', mfo: '01088', oked: '68202', director_name: 'Юсупов Р.Ё.', branch_id: 'yunusabad' },
      { id: 'cspace-maksim-gorkiy', name: 'ООО «C-SPACE MAKSIM GORKIY»', short_name: 'C-SPACE MAKSIM GORKIY', inn: '310121746', address: 'г.Ташкент, Мирзо-Улугбекский район, улица Чуст, дом 1', bank_name: 'АTБ «КАПИТАЛБАНК» г.Ташкент', bank_account: '2020 8000 7055 9992 3001', mfo: '01088', director_name: 'Тургунов Н.Ш.', branch_id: 'chust' },
      { id: 'cs-elbek', name: 'ООО «CS-ELBEK»', short_name: 'CS-ELBEK', inn: '309104868', address: 'г. Ташкент, Яшнабадский район, Choʻlpon MFY, улица KXАY, дом-36', bank_name: 'АTБ «КАПИТАЛБАНК» г.Ташкент', bank_account: '2020 8000 2054 6910 7001', mfo: '01088', oked: '96090', director_name: 'Юсупов Р.Ё.', branch_id: 'elbek' },
      { id: 'cspace-orient', name: 'ООО «C-Space Orient»', short_name: 'C-Space Orient', inn: '311155426', address: 'город Ташкент, Мирзо-Улугбекский район, махалля Элобод, улица Чуст, 1-дом', bank_name: 'Smartbank Центральное Операционное Отделение ФРБ "Капитал24"', bank_account: '2020 8000 9070 1993 4001', mfo: '01158', oked: '68202', director_name: 'Абдурахмонов З.', branch_id: 'orient' },
      { id: 'cs-aero', name: 'ООО «CS AERO»', short_name: 'CS AERO', inn: '311670554', address: 'г.Ташкент, Яккасарайский р-н, Muxandislar Mfy, Bobur Ko\'chasi, 58а-Uy', bank_name: 'Капиталбанк', bank_account: '2020 8000 5071 7370 8001', mfo: '01158', director_name: 'Юсупов Н.М.', branch_id: 'aero' },
      { id: 'cspace-muqumiy', name: 'ООО «CSPACE MUQUMIY»', short_name: 'CSPACE MUQUMIY', inn: '312334448', address: 'ГОРОД ТАШКЕНТ, ЧИЛАНЗАРСКИЙ РАЙОН, KATTA CHILONZOR-1 MFY, CHILONZOR KO\'CHASI, 1-B-UY', bank_name: '«КАПИТАЛБАНК» г.Ташкент', bank_account: '2020 8000 4072 8715 5001', mfo: '01158', director_name: 'Асомитдинов М.М.', branch_id: 'muqimiy' },
      { id: 'cspace-park', name: 'ООО «C-SPACE PARK»', short_name: 'C-SPACE PARK', inn: '311874798', address: 'ГОРОД ТАШКЕНТ, МИРЗО-УЛУГБЕКСКИЙ РАЙОН, NAVNIHOL MFY, DO\'RMON YO\'LI KO\'CHASI, 1-UY', bank_name: '«КАПИТАЛБАНК» г.Ташкент', bank_account: '2020 8000 0071 9480 4001', mfo: '01158', director_name: 'Тургунов Н.Ш.', branch_id: 'park' },
      { id: 'cspace-newport', name: 'СП ООО «C-SPACE NEWPORT»', short_name: 'C-SPACE NEWPORT', inn: '312028717', address: 'г.Ташкент, Мирзо-Улугбекский район, улица Чуст, дом 1', bank_name: '«КАПИТАЛБАНК» г.Ташкент', bank_account: '2021 4000 9072 2452 6001', mfo: '01158', nds_code: '303010288592', director_name: 'Ходиев Д.Б.', branch_id: 'newport' },
      { id: 'cspace-fargona', name: 'ООО "C-SPACE FARGONA"', short_name: 'C-SPACE FARGONA', inn: '312458300', address: 'ФЕРГАНСКАЯ ОБЛАСТЬ, ГОРОД ФЕРГАНА, YOSHLAR MFY, SHUKRONA KO\'CHASI, 30-UY, 58-XONADON', bank_name: '«КАПИТАЛБАНК»', bank_account: '2020 8000 7073 2363 6001', mfo: '01158', director_name: 'Асомитдинов М.М.', branch_id: 'fargona' },
    ];

    for (const entity of legalEntities) {
      const { error } = await supabase
        .from('legal_entities')
        .upsert(entity, { onConflict: 'id' });
      if (error) {
        results.push(`Entity ${entity.id}: ${error.message}`);
      } else {
        results.push(`Entity ${entity.id}: OK`);
      }
    }

    // Get counts
    const { count: branchCount } = await supabase.from('branches').select('*', { count: 'exact', head: true });
    const { count: entityCount } = await supabase.from('legal_entities').select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      branches: branchCount,
      legalEntities: entityCount,
      results
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
