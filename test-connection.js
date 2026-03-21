/* === TEMPORARY VERIFICATION SCRIPT === */

(async function verifySupabase() {
  // SHOW RESULT IN UI - Create non-intrusive status indicator
  const statusEl = document.createElement('div');
  statusEl.style.position = 'fixed';
  statusEl.style.bottom = '20px';
  statusEl.style.right = '20px';
  statusEl.style.padding = '8px 12px';
  statusEl.style.borderRadius = '8px';
  statusEl.style.fontFamily = 'sans-serif';
  statusEl.style.fontSize = '12px';
  statusEl.style.fontWeight = 'bold';
  statusEl.style.zIndex = '999999';
  statusEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  statusEl.textContent = 'DB Connecting...';
  statusEl.style.background = '#333';
  statusEl.style.color = '#fff';
  document.body.appendChild(statusEl);

  function setStatus(success) {
    if (success) {
      statusEl.textContent = 'DB Connected ✅';
      statusEl.style.background = '#111F15';
      statusEl.style.color = '#B4FF00'; // green
      statusEl.style.border = '1px solid #4D7A58';
    } else {
      statusEl.textContent = 'DB Error ❌';
      statusEl.style.background = '#1F0A0A';
      statusEl.style.color = '#FF4D4D'; // red
      statusEl.style.border = '1px solid #FF4D4D';
    }
  }

  try {
    console.log("=== SUPABASE VERIFICATION TEST ===");

    // CHECK ENV CONNECTION
    if (typeof NEXT_PUBLIC_SUPABASE_URL === 'undefined' || typeof NEXT_PUBLIC_SUPABASE_ANON_KEY === 'undefined') {
      console.error("Failsafe: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY variables.");
      throw new Error("Missing Env");
    }

    if (typeof _sb === 'undefined') {
      console.error("Failsafe: Supabase client '_sb' is not initialized.");
      throw new Error("Client Initialization Failed");
    }
    console.log("Supabase client initialized via NEXT_PUBLIC_SUPABASE_URL");

    // CLEANUP OLD TESTS
    console.log("Fixing old test rows with bad image URLs...");
    await _sb.from('reports')
      .update({ image_url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" })
      .eq('image_url', 'https://example.com/test.jpg');

    // CREATE AUTO TEST
    const testPayload = {
      description: "Auto test connection",
      location: "System",
      image_url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    };
    
    console.log("Attempting to insert test data into 'reports' table:", testPayload);
    const { data: insertResult, error: insertError } = await _sb.from('reports').insert(testPayload).select().single();
    
    // FAILSAFE FOR TABLE NOT EXISTING OR PERMISSION ISSUE
    if (insertError) {
      console.error("INSERT ERROR: table 'reports' may not exist, misconfigured, or fails RLS policies:", insertError);
      throw insertError;
    }

    console.log("Successfully inserted test row. Insert Result:", insertResult);

    // VERIFY INSERT (fetch latest row)
    console.log("Attempting to fetch latest row from 'reports' table...");
    const { data: fetchResult, error: fetchError } = await _sb.from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      console.error("FETCH ERROR: could not fetch latest row from 'reports':", fetchError);
      throw fetchError;
    }

    console.log("Successfully fetched latest test row. Fetch Result:", fetchResult);

    // If both succeeded, update UI
    setStatus(true);

  } catch (error) {
    // LOGGING - catch all errors
    console.error("DB connection/test failed:", error);
    setStatus(false);
  }
})();
