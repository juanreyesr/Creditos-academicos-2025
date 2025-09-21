const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let registros = [];
let contador = 1001;

// Página principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sistema de Créditos Académicos</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
            h1 { color: #333; text-align: center; }
            .form-group { margin: 15px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
            button:hover { background: #0056b3; }
            .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .stats { background: #e9ecef; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center; }
        </style>
    </head>
    <body>
        <h1>🎓 Sistema de Créditos Académicos</h1>
        <p style="text-align: center;">Colegio de Psicólogos de Guatemala</p>
        
        <div class="stats">
            <strong>Registros actuales: ${registros.length}</strong>
        </div>

        <form id="form">
            <div class="form-group">
                <label>Nombre Completo:</label>
                <input type="text" id="nombre" required>
            </div>
            
            <div class="form-group">
                <label>Teléfono:</label>
                <input type="tel" id="telefono" required>
            </div>
            
            <div class="form-group">
                <label>Número de Colegiado:</label>
                <input type="text" id="colegiado" required>
            </div>
            
            <div class="form-group">
                <label>Estado:</label>
                <select id="estado" required>
                    <option value="">Seleccionar...</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Actividad:</label>
                <input type="text" id="actividad" required>
            </div>
            
            <div class="form-group">
                <label>Horas:</label>
                <input type="number" id="horas" min="1" step="0.5" required>
            </div>
            
            <div class="form-group">
                <label>Fecha:</label>
                <input type="date" id="fecha" required>
            </div>
            
            <button type="submit">Registrar</button>
        </form>

        <div id="resultado"></div>

        <script>
            document.getElementById('form').onsubmit = async function(e) {
                e.preventDefault();
                
                const data = {
                    nombre: document.getElementById('nombre').value,
                    telefono: document.getElementById('telefono').value,
                    colegiado: document.getElementById('colegiado').value,
                    estado: document.getElementById('estado').value,
                    actividad: document.getElementById('actividad').value,
                    horas: document.getElementById('horas').value,
                    fecha: document.getElementById('fecha').value
                };

                try {
                    const response = await fetch('/api/registro', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        document.getElementById('resultado').innerHTML = 
                            '<div class="success">✅ Registro exitoso!<br>Correlativo: ' + result.correlativo + '<br>Créditos: ' + result.creditos + '</div>';
                        document.getElementById('form').reset();
                        setTimeout(() => location.reload(), 2000);
                    } else {
                        alert('Error: ' + result.error);
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            };
        </script>
    </body>
    </html>
  `);
});

// API para registrar
app.post('/api/registro', (req, res) => {
  try {
    const { nombre, telefono, colegiado, estado, actividad, horas, fecha } = req.body;
    
    if (!nombre || !telefono || !colegiado || !estado || !actividad || !horas || !fecha) {
      return res.json({ success: false, error: 'Faltan datos' });
    }

    const correlativo = `CPG-2025-${String(contador++).padStart(4, '0')}`;
    const creditos = (parseFloat(horas) / 16).toFixed(2);
    
    const registro = {
      correlativo,
      nombre,
      telefono,
      colegiado,
      estado,
      actividad,
      horas: parseFloat(horas),
      fecha,
      creditos: parseFloat(creditos),
      timestamp: new Date().toISOString()
    };
    
    registros.push(registro);
    console.log('Registro creado:', correlativo);
    
    res.json({
      success: true,
      correlativo,
      creditos,
      total: registros.length
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, error: 'Error interno' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', registros: registros.length, time: new Date().toISOString() });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor funcionando en puerto ${port}`);
  console.log('URL: http://localhost:' + port);
});
