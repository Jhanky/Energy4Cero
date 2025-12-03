<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>API Routes - {{ config('app.name') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'bounce-slow': 'bounce 2s infinite',
                        'spin-slow': 'spin 3s linear infinite',
                    }
                }
            }
        }
    </script>

    <style>
        .api-status-animation {
            background: linear-gradient(135deg, #10b981, #059669, #047857);
            background-size: 200% 200%;
            animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        .route-card {
            transition: all 0.2s ease-in-out;
        }

        .route-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .method-badge {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.125rem 0.5rem;
            border-radius: 0.375rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .method-get { background-color: #dbeafe; color: #1e40af; }
        .method-post { background-color: #dcfce7; color: #166534; }
        .method-put { background-color: #fef3c7; color: #92400e; }
        .method-patch { background-color: #fef3c7; color: #92400e; }
        .method-delete { background-color: #fee2e2; color: #991b1b; }

        .fade-in {
            animation: fadeIn 0.6s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .stagger-animation > * {
            animation: fadeIn 0.6s ease-in-out;
        }

        .stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
        .stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
        .stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
        .stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
        .stagger-animation > *:nth-child(5) { animation-delay: 0.5s; }
    </style>
</head>
<body class="bg-gray-50 font-sans antialiased">
    <div class="min-h-screen">
        <!-- API Status Animation Header -->
        <div class="api-status-animation">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div class="text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 animate-pulse-slow">
                        <svg class="w-8 h-8 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 class="text-4xl font-bold text-white mb-2">API Funcionando Perfectamente</h1>
                    <p class="text-xl text-white/90">Todas las rutas disponibles están operativas y listas para usar</p>
                    <div class="mt-6 flex items-center justify-center space-x-2">
                        <div class="w-3 h-3 bg-green-400 rounded-full animate-bounce-slow"></div>
                        <div class="w-3 h-3 bg-green-400 rounded-full animate-bounce-slow" style="animation-delay: 0.1s"></div>
                        <div class="w-3 h-3 bg-green-400 rounded-full animate-bounce-slow" style="animation-delay: 0.2s"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Routes Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Rutas de la API</h2>
                <p class="text-lg text-gray-600">Explora todas las rutas disponibles en la API, organizadas por módulos.</p>
            </div>

            @if($routes->isEmpty())
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No se encontraron rutas</h3>
                    <p class="mt-1 text-sm text-gray-500">No hay rutas API registradas en este momento.</p>
                </div>
            @else
                <div class="space-y-8 stagger-animation">
                    @foreach($routes as $group => $groupRoutes)
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden route-card fade-in">
                            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 class="text-lg font-semibold text-gray-900 capitalize">{{ $group }}</h3>
                                <p class="text-sm text-gray-600 mt-1">{{ count($groupRoutes) }} ruta{{ count($groupRoutes) !== 1 ? 's' : '' }}</p>
                            </div>

                            <div class="divide-y divide-gray-200">
                                @foreach($groupRoutes as $route)
                                    <div class="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div class="flex items-start justify-between">
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center space-x-3 mb-2">
                                                    @foreach($route['methods'] as $method)
                                                        @if(!in_array($method, ['HEAD', 'OPTIONS']))
                                                            <span class="method-badge method-{{ strtolower($method) }}">
                                                                {{ $method }}
                                                            </span>
                                                        @endif
                                                    @endforeach
                                                    <code class="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                        {{ $route['uri'] }}
                                                    </code>
                                                </div>

                                                @if($route['name'])
                                                    <p class="text-sm text-gray-600 mb-1">
                                                        <span class="font-medium">Nombre:</span> {{ $route['name'] }}
                                                    </p>
                                                @endif

                                                @if($route['middleware'])
                                                    <p class="text-sm text-gray-600 mb-1">
                                                        <span class="font-medium">Middleware:</span>
                                                        <span class="inline-flex flex-wrap gap-1">
                                                            @foreach($route['middleware'] as $middleware)
                                                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {{ $middleware }}
                                                                </span>
                                                            @endforeach
                                                        </span>
                                                    </p>
                                                @endif

                                                <p class="text-sm text-gray-500">
                                                    <span class="font-medium">Controlador:</span> {{ $route['action'] }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 mt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="text-center text-sm text-gray-500">
                    <p>API de {{ config('app.name') }} • Laravel {{ app()->version() }}</p>
                    <p class="mt-1">Generado el {{ now()->format('d/m/Y H:i:s') }}</p>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>
