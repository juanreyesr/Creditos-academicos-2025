console.log('🚀 Iniciando servidor...');
console.log('NODE_VERSION:', process.version);
console.log('ENV:', process.env.NODE_ENV);
console.log('PORT ENV:', process.env.PORT);

const express = require('express');
console.log('✅ Express cargado');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📡 Puerto configurado:', PORT);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middleware configurado');

// Storage
let registros = [];
let contador = 1001;

// HEALTH CHECK - PRIORIDAD MÁXIMA
app.get('/health', (req, res) => {
  console.log('🩺 Health check solicitado');
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime(),
    registros: registros.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Página principal solicitada');
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Créditos Académicos</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px; 
            background: #f8f9fa;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        }
        h1 { 
            color: #2c3e50; 
            text-align: center; 
            margin-bottom: 20px; 
        }
        .status { 
            background: #d4edda; 
            color: #155724; 
            padding: 15px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 20px 0; 
        }
        .form-group { 
            margin: 15px 0; 
        }
        label { 
            display: block; 
            margin-bottom: 5px; 
            font-weight: bold; 
        }
        input, select { 
            width: 100%; 
            padding: 10px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
            margin-bottom: 10px; 
        }
        button { 
            background: #007bff; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            width: 100%; 
        }
        button:hover { 
            background: #0056b3; 
        }
        .result { 
            margin: 20px 0; 
            padding: 15px; 
            border-radius: 5px; 
        }
        .success { 
            background: #d4edda; 
            color: #155724; 
        }
        .error { 
            background: #f8d7da; 
            color: #721c24; 
        }
        .credits { 
            background: #e8f5e8; 
            padding: 15px; 
            margin: 10px 0; 
            border-left: 4px solid #28a745; 
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 Sistema de Créditos Académicos</h1>
        <p style="text-align: center; color: #666;">Colegio de Psicólogos de Guatemala</p>
        
        <div class="status">
            ✅ Sistema funcionando correctamente en Railway<br>
            <small>Puerto: ${PORT} | Registros: ${registros.length}</small>
        </div>

        <form id="registroForm">
            <div class="form-group">
                <label for="nombre">Nombre Completo *</label>
                <input type="text" id="nombre" required>
            </div>
            
            <div class="form-group">
                <label for="telefono">Teléfono *</label>
                <input type="tel" id="telefono" required>
            </div>
            
            <div class="form-group">
                <label for="colegiado">Número de Colegiado *</label>
                <input type="text" id="colegiado" required>
            </div>
            
            <div class="form-group">
                <label for="estado">Estado de Colegiación *</label>
                <select id="estado" required>
                    <option value="">Seleccionar...</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="actividad">Actividad Académica *</label>
                <input type="text" id="actividad" required>
            </div>
            
            <div class="form-group">
                <label for="horas">Horas de la Actividad *</label>
                <input type="number" id="horas" min="1" step="0.5" required>
            </div>
            
            <div class="form-group">
                <label for="fecha">Fecha de la Actividad *</label>
                <input type="date" id="fecha" required>
            </div>
            
            <div class="credits">
                <strong>Créditos calculados: <span id="creditosDisplay">0.00</span></strong><br>
                <small>Según Artículo 16: 1 crédito = 16 horas de educación</small>
            </div>
            
            <button type="submit">Registrar Actividad</button>
        </form>

        <div id="resultado"></div>
    </div>

    <script>
        // Calcular créditos automáticamente
        document.getElementById('horas').addEventListener('input', function() {
            const horas = parseFloat(this.value) || 0;
            const creditos = (horas / 16).toFixed(2);
            document.getElementById('creditosDisplay').textContent = creditos;
        });

        // Manejar envío del formulario
        document.getElementById('registroForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                nombre: document.getElementById('nombre').value,
                telefono: document.getElementById('telefono').value,
                colegiado: document.getElementById('colegiado').value,
                estado: document.getElementById('estado').value,
                actividad: document.getElementById('actividad').value,
                horas: parseFloat(document.getElementById('horas').value),
                fecha: document.getElementById('fecha').value
            };

            try {
                const response = await fetch('/api/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('resultado').innerHTML = 
                        '<div class="result success">' +
                        '<h3>✅ Registro Exitoso</h3>' +
                        '<p><strong>Correlativo:</strong> ' + result.correlativo + '</p>' +
                        '<p><strong>Créditos obtenidos:</strong> ' + result.creditos + '</p>' +
                        '<p><strong>Fecha:</strong> ' + new Date().toLocaleString() + '</p>' +
                        '</div>';
                    
                    // Limpiar formulario
                    this.reset();
                    document.getElementById('creditosDisplay').textContent = '0.00';
                } else {
                    document.getElementById('resultado').innerHTML = 
                        '<div class="result error">❌ Error: ' + result.error + '</div>';
                }
            } catch (error) {
                document.getElementById('resultado').innerHTML = 
                    '<div class="result error">❌ Error de conexión: ' + error.message + '</div>';
            }
        });
    </script>
</body>
</html>
  `);
});

// API endpoint para registro
app.post('/api/registro', (req, res) => {
  console.log('📝 Nuevo registro solicitado');
  try {
    const { nombre, telefono, colegiado, estado, actividad, horas, fecha } = req.body;
    
    if (!nombre || !telefono || !colegiado || !estado || !actividad || !horas || !fecha) {
      console.log('❌ Faltan campos requeridos');
      return res.json({ success: false, error: 'Todos los campos son requeridos' });
    }

    const correlativo = `CPG-${new Date().getFullYear()}-${String(contador++).padStart(4, '0')}`;
    const creditos = (parseFloat(horas) / 16).toFixed(2);
    
    const nuevoRegistro = {
      id: Date.now(),
      correlativo,
      nombre,
      telefono,
      colegiado,
      estado,
      actividad,
      horas: parseFloat(horas),
      fecha,
      creditos: parseFloat(creditos),
      fechaRegistro: new Date().toISOString()
    };
    
    registros.push(nuevoRegistro);
    
    console.log(`✅ Registro creado: ${correlativo}`);
    
    res.json({
      success: true,
      correlativo,
      creditos,
      mensaje: 'Registro guardado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Info endpoint para debugging
app.get('/info', (req, res) => {
  res.json({
    status: 'running',
    port: PORT,
    registros: registros.length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    node: process.version
  });
});

console.log('✅ Endpoints configurados');

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 SERVIDOR RAILWAY INICIADO EXITOSAMENTE');
  console.log('='.repeat(60));
  console.log('📡 Puerto:', PORT);
  console.log('🌐 Host: 0.0.0.0');
  console.log('✅ Health check: /health');
  console.log('📊 Info endpoint: /info');
  console.log('📝 API registro: /api/registro');
  console.log('🏠 Página principal: /');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('='.repeat(60));
});

// Manejo de errores del servidor
server.on('error', (error) => {
  console.error('❌ ERROR DEL SERVIDOR:', error);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor (SIGTERM)');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor (SIGINT)');
  process.exit(0);
});

// Captura de errores no manejados
process.on('uncaughtException', (error) => {
  console.error('❌ ERROR NO CAPTURADO:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMESA RECHAZADA:', reason);
});

console.log('✅ Sistema de manejo de errores configurado');