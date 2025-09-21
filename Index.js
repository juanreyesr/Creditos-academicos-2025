const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Array para almacenar registros
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #667eea, #764ba2);
                min-height: 100vh;
                padding: 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            h1 { 
                color: #2c3e50; 
                text-align: center; 
                margin-bottom: 10px;
                font-size: 2em;
            }
            .subtitle {
                text-align: center; 
                color: #666; 
                margin-bottom: 30px;
                font-style: italic;
            }
            .status { 
                background: #d4edda; 
                color: #155724; 
                padding: 15px; 
                border-radius: 8px; 
                margin: 20px 0;
                border: 1px solid #c3e6cb;
                text-align: center;
            }
            .form-group { 
                margin: 15px 0; 
            }
            label { 
                display: block; 
                margin-bottom: 5px; 
                font-weight: bold;
                color: #333;
            }
            input, select { 
                width: 100%; 
                padding: 12px; 
                border: 2px solid #ddd; 
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s;
            }
            input:focus, select:focus { 
                outline: none;
                border-color: #007bff;
            }
            button { 
                background: #007bff; 
                color: white; 
                padding: 15px 30px; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer; 
                width: 100%;
                font-size: 16px;
                font-weight: bold;
                transition: background-color 0.3s;
            }
            button:hover { 
                background: #0056b3; 
            }
            button:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }
            .success { 
                background: #d4edda; 
                color: #155724; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;
                border: 1px solid #c3e6cb;
                text-align: center;
            }
            .error { 
                background: #f8d7da; 
                color: #721c24; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;
                border: 1px solid #f1b0b7;
                text-align: center;
            }
            .stats { 
                background: #e7f3ff; 
                border: 1px solid #007bff; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;
                text-align: center;
            }
            .credits {
                background: #e8f5e8;
                border-left: 4px solid #28a745;
                padding: 15px;
                margin: 15px 0;
                border-radius: 0 8px 8px 0;
            }
            .credits-number {
                font-size: 1.3em;
                font-weight: bold;
                color: #28a745;
            }
            .loading {
                display: inline-block;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 Sistema de Créditos Académicos</h1>
            <p class="subtitle">Colegio de Psicólogos de Guatemala</p>
            
            <div class="status">
                ✅ Sistema funcionando correctamente en Railway<br>
                <strong>Total de registros: ${registros.length}</strong>
            </div>

            <form id="registroForm">
                <div class="form-group">
                    <label for="nombre">Nombre Completo *</label>
                    <input type="text" id="nombre" required>
                </div>
                
                <div class="form-group">
                    <label for="telefono">Número de Teléfono *</label>
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
                    <input type="number" id="horas" min="0.5" step="0.5" required>
                </div>
                
                <div class="form-group">
                    <label for="fecha">Fecha de la Actividad *</label>
                    <input type="date" id="fecha" required>
                </div>
                
                <div class="credits">
                    <strong>📊 Cálculo Automático de Créditos:</strong><br>
                    <div class="credits-number" id="creditosDisplay">Créditos: 0.00</div>
                    <small>Según Artículo 16: Un crédito académico = 16 horas de educación</small>
                </div>
                
                <button type="submit" id="submitBtn">
                    📝 Registrar Actividad Académica
                </button>
            </form>

            <div id="resultado"></div>
        </div>

        <script>
            // Calcular créditos automáticamente
            document.getElementById('horas').addEventListener('input', function() {
                const horas = parseFloat(this.value) || 0;
                const creditos = (horas / 16).toFixed(2);
                document.getElementById('creditosDisplay').innerHTML = 
                    'Créditos: <strong>' + creditos + '</strong>';
            });

            // Configurar fecha máxima (hoy)
            document.getElementById('fecha').max = new Date().toISOString().split('T')[0];

            // Manejar envío del formulario
            document.getElementById('registroForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = document.getElementById('submitBtn');
                const originalText = submitBtn.innerHTML;
                
                // Deshabilitar botón
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="loading">⟳</span> Procesando...';
                
                const formData = {
                    nombre: document.getElementById('nombre').value.trim(),
                    telefono: document.getElementById('telefono').value.trim(),
                    colegiado: document.getElementById('colegiado').value.trim(),
                    estado: document.getElementById('estado').value,
                    actividad: document.getElementById('actividad').value.trim(),
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
                            '<div class="success">' +
                            '<h3>✅ ¡Registro Exitoso!</h3>' +
                            '<p><strong>Correlativo asignado:</strong> ' + result.correlativo + '</p>' +
                            '<p><strong>Créditos obtenidos:</strong> ' + result.creditos + '</p>' +
                            '<p><strong>Fecha de registro:</strong> ' + new Date().toLocaleString('es-GT') + '</p>' +
                            '<small>Conserve este número de correlativo para sus registros.</small>' +
                            '</div>';
                        
                        // Limpiar formulario
                        document.getElementById('registroForm').reset();
                        document.getElementById('creditosDisplay').innerHTML = 'Créditos: <strong>0.00</strong>';
                        
                        // Recargar página en 3 segundos para actualizar contador
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                        
                    } else {
                        document.getElementById('resultado').innerHTML = 
                            '<div class="error">❌ Error: ' + (result.error || 'Error desconocido') + '</div>';
                    }
                    
                } catch (error) {
                    document.getElementById('resultado').innerHTML = 
                        '<div class="error">❌ Error de conexión: ' + error.message + '</div>';
                } finally {
                    // Rehabilitar botón
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });

            console.log('✅ Sistema de Créditos Académicos cargado correctamente');
        </script>
    </body>
    </html>
  `);
});

// API para registrar nueva actividad
app.post('/api/registro', (req, res) => {
  try {
    const { nombre, telefono, colegiado, estado, actividad, horas, fecha } = req.body;
    
    // Validaciones
    if (!nombre || !telefono || !colegiado || !estado || !actividad || !horas || !fecha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Todos los campos marcados con * son obligatorios' 
      });
    }

    if (isNaN(horas) || horas <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Las horas deben ser un número mayor a 0' 
      });
    }

    // Generar correlativo único
    const correlativo = `CPG-${new Date().getFullYear()}-${String(contador++).padStart(4, '0')}`;
    const creditos = (parseFloat(horas) / 16).toFixed(2);
    
    const nuevoRegistro = {
      id: Date.now(),
      correlativo,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      colegiado: colegiado.trim(),
      estado,
      actividad: actividad.trim(),
      horas: parseFloat(horas),
      fecha,
      creditos: parseFloat(creditos),
      fechaRegistro: new Date().toISOString(),
      ip: req.ip || 'unknown'
    };
    
    registros.push(nuevoRegistro);
    
    console.log(`✅ Nuevo registro creado: ${correlativo} - ${nombre}`);
    
    res.json({
      success: true,
      correlativo,
      creditos,
      mensaje: 'Actividad académica registrada exitosamente',
      totalRegistros: registros.length
    });
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// API para estadísticas básicas
app.get('/api/estadisticas', (req, res) => {
  try {
    const totalRegistros = registros.length;
    const totalCreditos = registros.reduce((sum, r) => sum + r.creditos, 0).toFixed(2);
    const totalHoras = registros.reduce((sum, r) => sum + r.horas, 0);
    const colegiadosActivos = registros.filter(r => r.estado === 'Activo').length;
    
    res.json({
      totalRegistros,
      totalCreditos: parseFloat(totalCreditos),
      totalHoras,
      colegiadosActivos,
      ultimoRegistro: registros.length > 0 ? registros[registros.length - 1].correlativo : null
    });
  } catch (error) {
    console.error('Error en estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Health check para Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    service: 'Sistema de Créditos Académicos',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    registros: registros.length,
    version: '1.0.0'
  });
});

// Ruta de información
app.get('/info', (req, res) => {
  res.json({
    sistema: 'Créditos Académicos',
    institucion: 'Colegio de Psicólogos de Guatemala',
    version: '1.0.0',
    estado: 'Funcionando',
    puerto: PORT,
    registros: registros.length,
    ultimaActualizacion: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor' 
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor iniciado exitosamente`);
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Sistema de Créditos Académicos funcionando`);
  console.log(`📊 Health check disponible en /health`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor...');
  process.exit(0);
});
