"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is an advanced example for creating icon bundles for Iconify SVG Framework.
 *
 * It creates a bundle from:
 * - All SVG files in a directory.
 * - Custom JSON files.
 * - Iconify icon sets.
 * - SVG framework.
 *
 * This example uses Iconify Tools to import and clean up icons.
 * For Iconify Tools documentation visit https://docs.iconify.design/tools/tools2/
 */
const fs_1 = require("fs");
const path_1 = require("path");
// Installation: npm install --save-dev @iconify/tools @iconify/utils @iconify/json @iconify/iconify
const tools_1 = require("@iconify/tools");
const utils_1 = require("@iconify/utils");
const sources = {
    svg: [
    // {
    //   dir: 'svg',
    //   monotone: true,
    //   prefix: 'custom',
    // },
    // {
    //   dir: 'emojis',
    //   monotone: false,
    //   prefix: 'emoji',
    // },
    ],
    icons: [
    // 'mdi:home',
    // 'mdi:account',
    // 'mdi:login',
    // 'mdi:logout',
    // 'octicon:book-24',
    // 'octicon:code-square-24',
    ],
    json: [
        // Custom JSON file
        // 'json/gg.json',
        // Iconify JSON file (@iconify/json is a package name, /json/ is directory where files are, then filename)
        {
            filename: require.resolve('@iconify-json/mdi/icons.json'),
            // ℹ️ 실제 사용 중인 아이콘만 골라 번들 크기를 줄였습니다 (전체 MDI 세트 대신).
            // 새 아이콘을 쓰면 이 목록에 추가하세요.
            icons: [
            'ab-testing',
            'abacus',
            'abjad-arabic',
            'abjad-hebrew',
            'abugida-devanagari',
            'abugida-thai',
            'access-point',
            'access-point-check',
            'access-point-minus',
            'access-point-network',
            'access-point-network-off',
            'access-point-off',
            'access-point-plus',
            'access-point-remove',
            'account',
            'account-alert-outline',
            'account-arrow-left-outline',
            'account-arrow-right-outline',
            'account-box-multiple-outline',
            'account-box-outline',
            'account-cancel-outline',
            'account-cash-outline',
            'account-check-outline',
            'account-child-outline',
            'account-circle-outline',
            'account-clock-outline',
            'account-cog-outline',
            'account-details-outline',
            'account-group',
            'account-group-outline',
            'account-multiple-outline',
            'account-outline',
            'account-plus-outline',
            'account-school-outline',
            'airplane',
            'alarm',
            'alarm-check',
            'alarm-light-outline',
            'alert-box-outline',
            'alert-circle-check-outline',
            'alert-circle-outline',
            'alert-decagram-outline',
            'alert-minus-outline',
            'alert-octagon-outline',
            'alert-outline',
            'alert-plus-outline',
            'alpha-b',
            'alpha-g',
            'alpha-r',
            'alpha-t-box-outline',
            'android',
            'apple',
            'archive-outline',
            'arrow-bottom-left',
            'arrow-bottom-right',
            'arrow-collapse-all',
            'arrow-down',
            'arrow-down-left',
            'arrow-left',
            'arrow-right',
            'arrow-top-left',
            'arrow-top-right',
            'arrow-up',
            'attachment',
            'badge-account-outline',
            'bell-off-outline',
            'bell-outline',
            'block-helper',
            'bookmark-outline',
            'briefcase-download-outline',
            'briefcase-outline',
            'briefcase-variant-outline',
            'cached',
            'cake',
            'cake-variant-outline',
            'calendar',
            'calendar-blank',
            'calendar-blank-outline',
            'calendar-check-outline',
            'camera-outline',
            'camera-plus-outline',
            'cancel',
            'cart-outline',
            'cart-plus',
            'cellphone',
            'cellphone-link',
            'chart-bell-curve',
            'chart-bell-curve-cumulative',
            'chart-donut',
            'chart-timeline-variant',
            'check',
            'check-all',
            'check-circle',
            'check-circle-outline',
            'check-outline',
            'checkbox-blank-circle',
            'checkbox-marked-circle-outline',
            'checkbox-multiple-outline',
            'chevron-double-left',
            'chevron-double-right',
            'chevron-down',
            'chevron-left',
            'chevron-right',
            'chevron-up',
            'circle',
            'circle-outline',
            'clipboard-outline',
            'clipboard-play-outline',
            'clipboard-text',
            'clock-outline',
            'clock-time-four-outline',
            'close',
            'close-circle',
            'close-circle-outline',
            'close-outline',
            'cloud-check-outline',
            'cloud-download-outline',
            'cloud-outline',
            'cloud-upload-outline',
            'code-tags',
            'cog',
            'cog-outline',
            'comment-outline',
            'compass-off-outline',
            'contactless-payment-circle-outline',
            'content-copy',
            'content-save',
            'content-save-outline',
            'cpu-32-bit',
            'credit-card-outline',
            'crown-outline',
            'cube-outline',
            'currency-usd',
            'delete-outline',
            'diamond-outline',
            'dots-horizontal',
            'dots-vertical',
            'download-outline',
            'earth',
            'email-open-outline',
            'email-outline',
            'emoticon-excited-outline',
            'emoticon-happy-outline',
            'emoticon-sad-outline',
            'eye-off-outline',
            'eye-outline',
            'facebook',
            'file-document-outline',
            'file-edit-outline',
            'file-find-outline',
            'file-multiple-outline',
            'file-outline',
            'file-pdf-box',
            'filter-variant',
            'fire',
            'firework',
            'flag-outline',
            'flask-empty-outline',
            'folder-outline',
            'format-align-center',
            'format-align-justify',
            'format-align-left',
            'format-align-right',
            'forum-outline',
            'gesture-tap-button',
            'github',
            'google',
            'heart',
            'heart-outline',
            'help-circle-outline',
            'history',
            'home-outline',
            'image-outline',
            'information-outline',
            'information-variant',
            'instagram',
            'invert-colors',
            'label-outline',
            'language-javascript',
            'language-typescript',
            'laptop',
            'layers-outline',
            'leaf',
            'lifebuoy',
            'link',
            'link-variant',
            'linkedin',
            'lock-open-outline',
            'lock-outline',
            'logout-variant',
            'magnify',
            'magnify-minus-outline',
            'magnify-plus-outline',
            'map-marker-off-outline',
            'map-marker-outline',
            'map-outline',
            'material-design',
            'memory',
            'menu',
            'menu-left',
            'menu-right',
            'menu-up',
            'message-outline',
            'microphone',
            'microphone-outline',
            'microsoft-windows',
            'minus',
            'minus-circle-outline',
            'package-variant',
            'paperclip',
            'pause',
            'pencil-outline',
            'phone',
            'phone-outline',
            'play',
            'plus',
            'plus-outline',
            'poll',
            'radiobox-blank',
            'radiobox-marked',
            'record-circle-outline',
            'refresh',
            'registered-trademark',
            'reload',
            'rocket',
            'school',
            'school-outline',
            'send-outline',
            'server',
            'share-variant',
            'share-variant-outline',
            'shield-lock-outline',
            'shield-outline',
            'shopping-outline',
            'snowflake',
            'square-edit-outline',
            'star',
            'star-circle-outline',
            'star-half',
            'star-outline',
            'target',
            'thumb-down-outline',
            'thumb-up-outline',
            'translate',
            'trash-can-outline',
            'trending-up',
            'truck-outline',
            'twitter',
            'update',
            'upload-outline',
            'video-outline',
            'view-dashboard-outline',
            'view-grid-outline',
            'view-grid-plus-outline',
            'volume',
            'vuejs',
            'vuetify',
            'water',
            'water-outline',
            'weather-night',
            'weather-sunny',
            'weather-sunset',
            'web',
            'whatsapp',
            'wrench-outline',
            ],
        },
        // Custom file with only few icons
        // {
        //   filename: require.resolve('@iconify-json/line-md/icons.json'),
        //   icons: [
        //     'home-twotone-alt',
        //     'github',
        //     'document-list',
        //     'document-code',
        //     'image-twotone',
        //   ],
        // },
    ],
};
// Iconify component (this changes import statement in generated file)
// Available options: '@iconify/react' for React, '@iconify/vue' for Vue 3, '@iconify/vue2' for Vue 2, '@iconify/svelte' for Svelte
const component = '@iconify/vue';
// Set to true to use require() instead of import
const commonJS = false;
// File to save bundle to
const target = (0, path_1.join)(__dirname, 'icons-bundle.js');
/**
 * Do stuff!
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
(async function () {
    let bundle = commonJS
        ? `const { addCollection } = require('${component}');\n\n`
        : `import { addCollection } from '${component}';\n\n`;
    // Create directory for output if missing
    const dir = (0, path_1.dirname)(target);
    try {
        await fs_1.promises.mkdir(dir, {
            recursive: true,
        });
    }
    catch (err) {
        //
    }
    /**
     * Convert sources.icons to sources.json
     */
    if (sources.icons) {
        const sourcesJSON = sources.json ? sources.json : (sources.json = []);
        // Sort icons by prefix
        const organizedList = organizeIconsList(sources.icons);
        for (const prefix in organizedList) {
            const filename = require.resolve(`@iconify/json/json/${prefix}.json`);
            sourcesJSON.push({
                filename,
                icons: organizedList[prefix],
            });
        }
    }
    /**
     * Bundle JSON files
     */
    if (sources.json) {
        for (let i = 0; i < sources.json.length; i++) {
            const item = sources.json[i];
            // Load icon set
            const filename = typeof item === 'string' ? item : item.filename;
            let content = JSON.parse(await fs_1.promises.readFile(filename, 'utf8'));
            // Filter icons
            if (typeof item !== 'string' && item.icons?.length) {
                const filteredContent = (0, utils_1.getIcons)(content, item.icons);
                if (!filteredContent)
                    throw new Error(`Cannot find required icons in ${filename}`);
                content = filteredContent;
            }
            // Remove metadata and add to bundle
            removeMetaData(content);
            (0, utils_1.minifyIconSet)(content);
            bundle += `addCollection(${JSON.stringify(content)});\n`;
            console.log(`Bundled icons from ${filename}`);
        }
    }
    /**
     * Custom SVG
     */
    if (sources.svg) {
        for (let i = 0; i < sources.svg.length; i++) {
            const source = sources.svg[i];
            // Import icons
            const iconSet = await (0, tools_1.importDirectory)(source.dir, {
                prefix: source.prefix,
            });
            // Validate, clean up, fix palette and optimise
            await iconSet.forEach(async (name, type) => {
                if (type !== 'icon')
                    return;
                // Get SVG instance for parsing
                const svg = iconSet.toSVG(name);
                if (!svg) {
                    // Invalid icon
                    iconSet.remove(name);
                    return;
                }
                // Clean up and optimise icons
                try {
                    // Clean up icon code
                    await (0, tools_1.cleanupSVG)(svg);
                    if (source.monotone) {
                        // Replace color with currentColor, add if missing
                        // If icon is not monotone, remove this code
                        await (0, tools_1.parseColors)(svg, {
                            defaultColor: 'currentColor',
                            callback: (attr, colorStr, color) => {
                                return !color || (0, tools_1.isEmptyColor)(color)
                                    ? colorStr
                                    : 'currentColor';
                            },
                        });
                    }
                    // Optimise
                    await (0, tools_1.runSVGO)(svg);
                }
                catch (err) {
                    // Invalid icon
                    console.error(`Error parsing ${name} from ${source.dir}:`, err);
                    iconSet.remove(name);
                    return;
                }
                // Update icon from SVG instance
                iconSet.fromSVG(name, svg);
            });
            console.log(`Bundled ${iconSet.count()} icons from ${source.dir}`);
            // Export to JSON
            const content = iconSet.export();
            bundle += `addCollection(${JSON.stringify(content)});\n`;
        }
    }
    // Save to file
    await fs_1.promises.writeFile(target, bundle, 'utf8');
    console.log(`Saved ${target} (${bundle.length} bytes)`);
})().catch(err => {
    console.error(err);
});
/**
 * Remove metadata from icon set
 */
function removeMetaData(iconSet) {
    const props = [
        'info',
        'chars',
        'categories',
        'themes',
        'prefixes',
        'suffixes',
    ];
    props.forEach(prop => {
        delete iconSet[prop];
    });
}
/**
 * Sort icon names by prefix
 */
function organizeIconsList(icons) {
    const sorted = Object.create(null);
    icons.forEach(icon => {
        const item = (0, utils_1.stringToIcon)(icon);
        if (!item)
            return;
        const prefix = item.prefix;
        const prefixList = sorted[prefix]
            ? sorted[prefix]
            : (sorted[prefix] = []);
        const name = item.name;
        if (!prefixList.includes(name))
            prefixList.push(name);
    });
    return sorted;
}
