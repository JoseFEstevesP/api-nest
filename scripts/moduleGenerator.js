import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEMPLATES } from './templates.js';

// Configuración
const CONFIG = {
	modulesDirectory: './src/modules',
	migrationsDirectory: './src/migrations',
	permissionsFile: './src/modules/security/rol/enum/permissions.ts',
};

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para capitalizar la primera letra
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para crear directorios recursivamente
function createDirectories(basePath, directories) {
	directories.forEach(dir => {
		const dirPath = path.join(basePath, dir);
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
			console.log(`✓ Directorio creado: ${dirPath}`);
		}
	});
}

// Función para crear archivos con contenido
function createFile(filePath, content) {
	const dirPath = path.dirname(filePath);
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, content);
		console.log(`✓ Archivo creado: ${filePath}`);
	}
}

// Función para actualizar el archivo de permisos
function updatePermissionsFile(moduleName) {
	try {
		const permissionsPath = path.resolve(CONFIG.permissionsFile);

		if (!fs.existsSync(permissionsPath)) {
			console.log(
				`⚠️  Archivo de permisos no encontrado en: ${permissionsPath}`,
			);
			return;
		}

		let content = fs.readFileSync(permissionsPath, 'utf8');

		// Generar los nuevos permisos
		const modulePermissions = [
			`\t${moduleName} = '${moduleName.toUpperCase()}',`,
			`\t${moduleName}Add = '${moduleName.toUpperCase()}_ADD',`,
			`\t${moduleName}Read = '${moduleName.toUpperCase()}_READ',`,
			`\t${moduleName}ReadOne = '${moduleName.toUpperCase()}_READ_ONE',`,
			`\t${moduleName}Update = '${moduleName.toUpperCase()}_UPDATE',`,
			`\t${moduleName}Delete = '${moduleName.toUpperCase()}_DELETE',`,
		];

		// Verificar si ALGUNO de los permisos ya existe
		const exists = modulePermissions.some(permission =>
			content.includes(permission.trim()),
		);

		if (exists) {
			console.log('✓ Permisos ya existen en el archivo');
			return;
		}

		// Buscar el enum Permission { ... }
		const enumRegex = /export\s+enum\s+Permission\s*{([^}]*)}/;
		const match = content.match(enumRegex);

		if (!match) {
			console.log('⚠️  No se encontró el enum "Permission" en el archivo.');
			return;
		}

		const enumBody = match[1]; // Contenido dentro del enum
		const enumEndIndex = match.index + match[0].length - 1; // Posición del }

		// Verificar si el último carácter antes del } es una coma
		const trimmedBody = enumBody.trim();

		// Construir el texto a insertar
		const newPermissionsText = modulePermissions.join('\n');

		// Si el cuerpo no está vacío y no termina en coma, añadir coma al último elemento
		let finalInsert;
		if (trimmedBody && !trimmedBody.endsWith(',')) {
			// Añadir coma al último elemento existente
			const lastLineEnd = content.lastIndexOf(',', enumEndIndex);
			const afterLastComma = content.slice(lastLineEnd + 1, enumEndIndex);
			// Reescribir con coma + nuevos permisos
			finalInsert = `,${afterLastComma}\n${newPermissionsText}`;
		} else {
			// Ya termina en coma o está vacío
			finalInsert = `\n${newPermissionsText}`;
		}

		// Insertar justo antes del }
		const newContent =
			content.slice(0, enumEndIndex) +
			finalInsert +
			content.slice(enumEndIndex);

		fs.writeFileSync(permissionsPath, newContent);
		console.log('✓ Permisos agregados al archivo de permisos');
	} catch (error) {
		console.error(
			'⚠️  Error al actualizar el archivo de permisos:',
			error.message,
		);
	}
}

// Función para actualizar el archivo de app.module.ts
function updateAppModule(moduleName) {
	try {
		const capitalizedName = capitalizeFirstLetter(moduleName);
		const appModulePath = path.resolve('./src/app.module.ts');

		if (!fs.existsSync(appModulePath)) {
			console.log(
				`⚠️  Archivo app.module.ts no encontrado en: ${appModulePath}`,
			);
			return;
		}

		let content = fs.readFileSync(appModulePath, 'utf8');

		// Verificar si el módulo ya está importado
		if (
			content.includes(`from './modules/${moduleName}/${moduleName}.module'`)
		) {
			console.log('✓ Módulo ya existe en app.module.ts');
			return;
		}

		// 1. AGREGAR IMPORTACIÓN - Después de la última importación existente
		const lastImportRegex = /import.*from.*;\s*\n(?!\s*import)/;
		const lastImportMatch = content.match(lastImportRegex);

		if (lastImportMatch) {
			const lastImportIndex =
				content.lastIndexOf(lastImportMatch[0]) + lastImportMatch[0].length;
			const newImport = `import { ${capitalizedName}Module } from './modules/${moduleName}/${moduleName}.module';\n`;
			content =
				content.slice(0, lastImportIndex) +
				newImport +
				content.slice(lastImportIndex);
		}

		// 2. AGREGAR AL ARRAY DE IMPORTS - Buscar el patrón exacto: "AuthModule," con su nueva línea
		const authModulePattern = /AuthModule,\s*\n/;
		const authModuleMatch = content.match(authModulePattern);

		if (authModuleMatch) {
			const authModuleIndex =
				content.indexOf(authModuleMatch[0]) + authModuleMatch[0].length;

			// Insertar el nuevo módulo manteniendo la misma indentación
			const indentMatch = authModuleMatch[0].match(/\n(\s*)AuthModule/);
			const indent = indentMatch ? indentMatch[1] : '\t\t';

			const newModule = `${indent}${capitalizedName}Module,\n`;
			content =
				content.slice(0, authModuleIndex) +
				newModule +
				content.slice(authModuleIndex);
		} else {
			// Fallback: buscar el cierre del array de imports
			const importsEndPattern = /,\s*\n\s*\]\s*,/;
			const importsEndMatch = content.match(importsEndPattern);

			if (importsEndMatch) {
				const importsEndIndex = content.indexOf(importsEndMatch[0]);
				const newModule = `\t\t${capitalizedName}Module,\n`;
				content =
					content.slice(0, importsEndIndex) +
					newModule +
					content.slice(importsEndIndex);
			}
		}

		fs.writeFileSync(appModulePath, content);
		console.log('✓ Módulo agregado correctamente a app.module.ts');
	} catch (error) {
		console.error('⚠️  Error al actualizar app.module.ts:', error.message);
	}
}

// Función para crear migración automáticamente
function createMigration(moduleName) {
	try {
		const capitalizedName = capitalizeFirstLetter(moduleName);
		const tableName = `${capitalizedName}s`;
		const migrationName = `create-${moduleName}`;

		console.log(`\nGenerando migración para: ${tableName}`);

		// Ejecutar el comando para crear la migración
		execSync(`pnpm migrate:create ${migrationName}`, {
			stdio: 'inherit',
			cwd: path.resolve(__dirname, '..'),
		});

		console.log('✓ Migración creada exitosamente');

		// Encontrar el archivo de migración más reciente
		const migrationFiles = fs
			.readdirSync(CONFIG.migrationsDirectory)
			.filter(file => file.endsWith('.js') && file.includes(migrationName))
			.sort()
			.reverse();

		if (migrationFiles.length > 0) {
			const latestMigration = migrationFiles[0];
			const migrationPath = path.join(
				CONFIG.migrationsDirectory,
				latestMigration,
			);

			// Contenido de la migración basado en el ejemplo
			const migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('${tableName}', {
			uid: {
				type: Sequelize.UUID,
				primaryKey: true,
				unique: true,
				allowNull: false,
			},
			status: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
				allowNull: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('${tableName}');
	},
};
`;

			// Sobrescribir el contenido de la migración
			fs.writeFileSync(migrationPath, migrationContent);
			console.log(
				`✓ Contenido de migración actualizado en: ${latestMigration}`,
			);
		}
	} catch (error) {
		console.log(
			'⚠️  No se pudo generar la migración automáticamente.',
			error.message,
		);
		console.log('💡 Ejecuta manualmente:');
		console.log(`pnpm migrate:create create-${moduleName}`);
		console.log('Y luego actualiza el contenido del archivo de migración con:');
		console.log(`
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('${capitalizeFirstLetter(moduleName)}s', {
			uid: {
				type: Sequelize.UUID,
				primaryKey: true,
				unique: true,
				allowNull: false,
			},
			status: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
				allowNull: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('${capitalizeFirstLetter(moduleName)}s');
	},
};
		`);
	}
}

// Función principal para generar el módulo
function generateModule() {
	console.log('=== Generador de Módulos NestJS ===\n');

	// Solicitar nombre del nuevo módulo
	const moduleName = process.argv[2];
	if (!moduleName) {
		console.error(
			'Error: Debes proporcionar el nombre del módulo como argumento.',
		);
		console.log('Uso: node moduleGenerator.js <nombre-del-módulo>');
		process.exit(1);
	}

	const capitalizedName = capitalizeFirstLetter(moduleName);

	// Crear ruta del módulo
	const modulePath = path.resolve(CONFIG.modulesDirectory, moduleName);

	// Crear estructura de directorios
	const directories = ['', 'dto', 'entities', 'enum', 'repository', 'use-case'];

	createDirectories(modulePath, directories);

	// Crear archivos principales (3 archivos en la raíz)
	createFile(
		path.join(modulePath, 'msg.ts'),
		TEMPLATES.msg(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, `${moduleName}.controller.ts`),
		TEMPLATES.controller(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, `${moduleName}.module.ts`),
		TEMPLATES.module(moduleName, capitalizedName),
	);

	// Crear DTOs (5 archivos)
	createFile(
		path.join(modulePath, 'dto', `${moduleName}Delete.dto.ts`),
		TEMPLATES.dto.delete(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'dto', `${moduleName}Get.dto.ts`),
		TEMPLATES.dto.get(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'dto', `${moduleName}GetAll.dto.ts`),
		TEMPLATES.dto.getAll(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'dto', `${moduleName}Register.dto.ts`),
		TEMPLATES.dto.register(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'dto', `${moduleName}Update.dto.ts`),
		TEMPLATES.dto.update(moduleName, capitalizedName),
	);

	// Crear entidad (1 archivo)
	createFile(
		path.join(modulePath, 'entities', `${moduleName}.entity.ts`),
		TEMPLATES.entity(moduleName, capitalizedName),
	);

	// Crear enums (1 archivos)
	createFile(
		path.join(modulePath, 'enum', 'orderProperty.ts'),
		TEMPLATES.enums.orderProperty(moduleName, capitalizedName),
	);

	// Crear repositorio (1 archivo)
	createFile(
		path.join(modulePath, 'repository', `${moduleName}.repository.ts`),
		TEMPLATES.repository(moduleName, capitalizedName),
	);

	// Crear use cases (5 archivos)
	createFile(
		path.join(modulePath, 'use-case', `create${capitalizedName}.use-case.ts`),
		TEMPLATES.useCases.create(moduleName, capitalizedName),
	);
	createFile(
		path.join(
			modulePath,
			'use-case',
			`findAll${capitalizedName}sPagination.use-case.ts`,
		),
		TEMPLATES.useCases.findAllPagination(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'use-case', `findOne${capitalizedName}.use-case.ts`),
		TEMPLATES.useCases.findOne(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'use-case', `remove${capitalizedName}.use-case.ts`),
		TEMPLATES.useCases.remove(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'use-case', `update${capitalizedName}.use-case.ts`),
		TEMPLATES.useCases.update(moduleName, capitalizedName),
	);

	// Actualizar el archivo de permisos global
	updatePermissionsFile(moduleName);

	// Crear migración automáticamente
	createMigration(moduleName);

	// Actualizar app.module.ts con el nuevo módulo
	updateAppModule(moduleName);

	console.log(
		`\n✓ Módulo "${moduleName}" generado exitosamente en: ${modulePath}`,
	);
	console.log(
		'\n⚠️  IMPORTANTE: Revisa y ajusta los archivos según las necesidades específicas de tu módulo.',
	);
}

// Ejecutar la generación del módulo
generateModule();
