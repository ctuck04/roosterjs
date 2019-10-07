import fragmentHandler from '../Paste/fragmentHandler';
import { htmlToDom } from 'roosterjs-html-sanitizer';

describe('fragmentHandler', () => {
    function runTest(html: string, preserveFragmentOnly: boolean, expectedInnerHtml: string) {
        let doc = htmlToDom(html, preserveFragmentOnly, fragmentHandler);
        if (expectedInnerHtml === null) {
            expect(doc).toBeNull();
        } else {
            expect(doc.body.innerHTML).toBe(expectedInnerHtml);
        }
    }

    it('HTML with fragment from EXCEL', () => {
        runTest(
            '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><body><table><tr><!--StartFragment--><td>a</td><td></td><!--EndFragment--></tr></table></body></html>',
            true,
            '<table><tbody><tr><td style="border: 1px solid rgb(212, 212, 212);">a</td><td style="border: 1px solid rgb(212, 212, 212);"></td></tr></tbody></table>'
        );
        runTest(
            '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><body><table><!--StartFragment--><tr><td>a</td><td></td></tr><!--EndFragment--></table></body></html>',
            true,
            '<table><tbody><tr><td style="border: 1px solid rgb(212, 212, 212);">a</td><td style="border: 1px solid rgb(212, 212, 212);"></td></tr></tbody></table>'
        );
    });

    describe('HTML with fragment from Word Online', () => {
        describe('fragments only contain list items', () => {
            it('has all list items on the same level', () => {
                runTest(
                    '<html><body><div class="ListContainerWrapper BCX0 SCXW225173058"><ul class="BulletListStyle1"><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">A</li></ul></div><div class="ListContainerWrapper BCX0 SCXW225173058"><ul><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">B</li></ul></div><div class="ListContainerWrapper BCX0 SCXW225173058"><ul><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">C</li></ul></div></body></html>',
                    true,
                    '<ul><li role="listitem" data-aria-level="1">A</li><li role="listitem" data-aria-level="1">B</li><li role="listitem" data-aria-level="1">C</li></ul>'
                );
            });

            // e.g.
            // .a
            //    .b
            //       .c
            it('List items on different level but only going on direction in terms of depth', () => {
                runTest(
                    '<html><body><div class="ListContainerWrapper BCX0 SCXW200751125"><ul class="BulletListStyle1 BCX0 SCXW200751125"><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 24px;">A</li></ul></div><div class="ListContainerWrapper BCX0 SCXW200751125"><ul class="BulletListStyle2 BCX0 SCXW200751125" role="list"><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">B</li></ul></div><div class="ListContainerWrapper BCX0 SCXW200751125" style="margin: 0px;"><ul class="BulletListStyle2 BCX0 SCXW200751125" role="list"><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">C</li></ul></div></body></html>',
                    true,
                    '<ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW200751125">A</li><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW200751125">B</li><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW200751125">C</li></ul></ul></ul>'
                )
            });

            //
            // e.g.
            // .a
            //   .b
            //     .c
            //   .d
            //     .e
            it('List items on different level but have different branch in each level', () => {
                runTest(
                    '<html><body><div class="ListContainerWrapper SCXW81557186 BCX0"><ul class="BulletListStyle1"><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW81557186" style="margin: 0px 0px 0px 24px;">A</li></ul></div><div class="ListContainerWrapper SCXW81557186 BCX0"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW81557186" style="margin: 0px 0px 0px 72px;">B</li></ul></div><div class="ListContainerWrapper SCXW81557186 BCX0"><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr SCXW81557186 BCX0" style="margin: 0px 0px 0px 120px;">C</li></ul></div><div class="ListContainerWrapper SCXW81557186 BCX0"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr SCXW81557186 BCX0" style="margin: 0px 0px 0px 72px;">D</li></ul></div><div class="ListContainerWrapper SCXW81557186 BCX0"><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW81557186" style="margin: 0px 0px 0px 120px;">E</li></ul></div></body></html>',
                    true,
                    '<ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW81557186">A</li><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW81557186">B</li><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr SCXW81557186 BCX0">C</li></ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr SCXW81557186 BCX0">D</li><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW81557186">E</li></ul></ul></ul>'
                )
            });

            // List items on different level with different branch with a combination of
            // order and unordered list items
            // e.g.
            // .a
            //   .b
            //     1.c1
            //     2.c2
            //   .d
            it('List items on different level with different branch with a combination of order and unordered list items', () => {
                runTest(
                    '<html><body><div class="ListContainerWrapper BCX0 SCXW221836524"><ul class="BulletListStyle1"><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW221836524" style="margin: 0px 0px 0px 24px;"> A </li></ul></div><div class="ListContainerWrapper BCX0 SCXW221836524"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW221836524" style="margin: 0px 0px 0px 72px;"> B </li></ul></div><div class="ListContainerWrapper BCX0 SCXW221836524"><ol><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW221836524" style="margin: 0px 0px 0px 120px;"> C1 </li></ol></div><div class="ListContainerWrapper BCX0 SCXW221836524"><ol><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW221836524" style="margin: 0px 0px 0px 120px;"> C2 </li></ol></div><div class="ListContainerWrapper BCX0 SCXW221836524"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW221836524" style="margin: 0px 0px 0px 72px;"> D </li></ul></div></body></html>',
                    true,
                    '<ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW221836524"> A </li><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW221836524"> B </li><ol><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW221836524"> C1 </li><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW221836524"> C2 </li></ol><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW221836524"> D </li></ul></ul>'
                )
            })
        });

        describe('fragments contains both list and text', () => {
            // e.g.
            //text text
            // .a
            //   .b
            //     1.c1
            //     2.c2
            //   .d
            //text text
            it('only has text and ', () => {
                runTest(
                    '<html><body><div class="BCX0 SCXW32709461"><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ul class="BulletListStyle1"><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 24px;"> A </li></ul></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 72px;"> B </li></ul></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ol><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 120px;"> C1 </li></ol></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ol><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 120px;"> C2 </li></ol></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 72px;"> D </li></ul></div></div><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div></body></html>',
                    true,
                    '<div class="BCX0 SCXW32709461"><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div><ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW32709461"> A </li><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW32709461"> B </li><ol><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW32709461"> C1 </li><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW32709461"> C2 </li></ol><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW32709461"> D </li></ul></ul></div><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div>'
                )
            });

            // e.g.
            //text text
            // .a
            //   .b
            //     1.c1
            //     2.c2
            //   .d
            //text text
            // --------------
            //| text text    |
            // --------------
            //| .a           |
            //| .b           |
            //| .c           |
            //| .d           |
            // --------------
            it('fragments contains text, list and table that consist of list', () => {
                runTest(
                    '<html><body><div class="BCX0 SCXW32709461"><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ul class="BulletListStyle1"><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 24px;"> A </li></ul></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 72px;"> B </li></ul></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ol><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 120px;"> C1 </li></ol></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ol><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 120px;"> C2 </li></ol></div><div class="ListContainerWrapper BCX0 SCXW32709461"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW32709461" style="margin: 0px 0px 0px 72px;"> D </li></ul></div></div><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div><div class="OutlineElement Ltr BCX0 SCXW244795937"><div class="TableContainer SCXW244795937 BCX0"><table><tbody><tr><td><div><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div></div></td></tr><tr><td><div><div class="ListContainerWrapper SCXW244795937 BCX0"><ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW244795937" style="margin: 0px 0px 0px 24px;"> A </li><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW244795937" style="margin: 0px 0px 0px 24px;"> B </li><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW244795937" style="margin: 0px 0px 0px 24px;"> C </li><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW244795937" style="margin: 0px 0px 0px 24px;"> D </li></ul></div></div></td></tr></tbody></table></div></div><div class="OutlineElement Ltr BCX0 SCXW244795937"><p><span><span></span></span><span></span></p></div></body></html>',
                    true,
                    '<div class="BCX0 SCXW32709461"><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div><ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW32709461"> A </li><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW32709461"> B </li><ol><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW32709461"> C1 </li><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW32709461"> C2 </li></ol><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW32709461"> D </li></ul></ul></div><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div><div class="OutlineElement Ltr BCX0 SCXW244795937"><div class="TableContainer SCXW244795937 BCX0"><table><tbody><tr><td><div><div class="OutlineElement Ltr BCX0 SCXW32709461"><p><span><span>asdfasdf</span></span><span></span></p></div></div></td></tr><tr><td><div><ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW244795937"> A </li><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW244795937"> B </li><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW244795937"> C </li><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW244795937"> D </li></ul></div></td></tr></tbody></table></div></div><div class="OutlineElement Ltr BCX0 SCXW244795937"><p><span><span></span></span><span></span></p></div>'
                );
            });
        });

        // Unhappy cases
        // When the format is not there, Html should not be transformed.
        describe('Html should not be identified as word online', () => {
            it('does not have list container', () => {
                runTest(
                    '<html><body><ul class="BulletListStyle1"><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW81557186" style="margin: 0px 0px 0px 24px;">A</li></ul><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW81557186" style="margin: 0px 0px 0px 72px;">B</li></ul><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr SCXW81557186 BCX0" style="margin: 0px 0px 0px 120px;">C</li></ul><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr SCXW81557186 BCX0" style="margin: 0px 0px 0px 72px;">D</li></ul><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW81557186" style="margin: 0px 0px 0px 120px;">E</li></ul></body></html>',
                    true,
                    '<ul class="BulletListStyle1"><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW81557186" style="margin: 0px 0px 0px 24px;">A</li></ul><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW81557186" style="margin: 0px 0px 0px 72px;">B</li></ul><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr SCXW81557186 BCX0" style="margin: 0px 0px 0px 120px;">C</li></ul><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr SCXW81557186 BCX0" style="margin: 0px 0px 0px 72px;">D</li></ul><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW81557186" style="margin: 0px 0px 0px 120px;">E</li></ul>'
                );
            });

            it('does not have BulletListStyle or NumberListStyle but has ListContainerWrapper', () => {
                runTest(
                    '<html><body><div class="ListContainerWrapper BCX0 SCXW200751125"><ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 24px;">A</li></ul></div><div class="ListContainerWrapper BCX0 SCXW200751125"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">B</li></ul></div><div class="ListContainerWrapper BCX0 SCXW200751125" style="margin: 0px;"><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">C</li></ul></div></body></html>',
                    true,
                    '<div class="ListContainerWrapper BCX0 SCXW200751125"><ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 24px;">A</li></ul></div><div class="ListContainerWrapper BCX0 SCXW200751125"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">B</li></ul></div><div class="ListContainerWrapper BCX0 SCXW200751125" style="margin: 0px;"><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">C</li></ul></div>'
                );
            });

            it('does not have BulletListStyle or NumberListStyle but has no ListContainerWrapper', () => {
                runTest(
                    '<html><body><div class="BCX0 SCXW200751125"><ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 24px;">A</li></ul></div><div class="BCX0 SCXW200751125"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">B</li></ul></div><div class="BCX0 SCXW200751125" style="margin: 0px;"><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">C</li></ul></div></body></html>',
                    true,
                    '<div class="BCX0 SCXW200751125"><ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 24px;">A</li></ul></div><div class="BCX0 SCXW200751125"><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">B</li></ul></div><div class="BCX0 SCXW200751125" style="margin: 0px;"><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW200751125" style="margin: 0px 0px 0px 72px;">C</li></ul></div>'
                );
            });
        });

        describe('When html is not strictly formatted as word online, but can be identified as word online', () => {
            // html:
            // <div class="ListContainerWrapper">
            //     <ul class="BulletListStyle1"><li>text</li></ul>
            //     <ul><li>text</li></ul>
            // <div>
            // result:
            // .a
            // .b
            // .c
            it('should process html properly, if ListContainerWrapper contains two UL', () => {
                runTest(
                    '<html><body><div class="ListContainerWrapper BCX0 SCXW225173058"><ul class="BulletListStyle1"><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">A</li></ul><ul><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">B</li></ul></div><div class="ListContainerWrapper BCX0 SCXW225173058"><ul><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">C</li></ul></div></body></html>',
                    true,
                    '<ul><li role="listitem" data-aria-level="1">A</li><li role="listitem" data-aria-level="1">B</li><li role="listitem" data-aria-level="1">C</li></ul>'
                );
            });

            it('shuold process html properly, if ListContainerWrapper when list items are not in side ul tag', () => {

            });

            // html:
            // <div class="ListContainerWrapper">
            //     <ul class="BulletListStyle1">
            //        <li>text</li>
            //        <li>text</li>
            //        <ul>
            //            <li>text</li>
            //            <li>text</li>
            //        </ul>
            //     </ul>
            // <div>
            // result:
            // .a
            //   .b
            //     .c
            //   .d
            //     .e
            it('should process html properly, if ListContainerWrapper contains list that is already well formatted', () => {
                runTest(
                    '<html><body><div class="ListContainerWrapper SCXW81557186 BCX0"><ul class="BulletListStyle1"><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW81557186">A</li><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW81557186">B</li><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr SCXW81557186 BCX0">C</li></ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr SCXW81557186 BCX0">D</li><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW81557186">E</li></ul></ul></ul></div></body></html>',
                    true,
                    '<ul><li role="listitem" data-aria-level="1" class="OutlineElement Ltr BCX0 SCXW81557186">A</li><ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr BCX0 SCXW81557186">B</li><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr SCXW81557186 BCX0">C</li></ul><li role="listitem" data-aria-level="2" class="OutlineElement Ltr SCXW81557186 BCX0">D</li><ul><li role="listitem" data-aria-level="3" class="OutlineElement Ltr BCX0 SCXW81557186">E</li></ul></ul></ul>'
                );
            });

            // html:
            // <div class="ListContainerWrapper">
            //     <ul class="BulletListStyle1"></ul>
            //     <li>text</li>
            //     <li>text</li>
            // <div>
            // result:
            // .a
            // .b
            // .c
            it('should process html properly, if list item in a ListContainerWrapper are not inside ul', () => {
                runTest(
                    '<html><body><div class="ListContainerWrapper BCX0 SCXW225173058"><ul class="BulletListStyle1"></ul><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">A</li><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">B</li></div><div class="ListContainerWrapper BCX0 SCXW225173058"><ul><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">C</li></ul></div></body></html>',
                    true,
                    '<ul><li role="listitem" data-aria-level="1">A</li><li role="listitem" data-aria-level="1">B</li><li role="listitem" data-aria-level="1">C</li></ul>'
                );
            });

            // html:
            // <div class="ListContainerWrapper">
            //     <ol class="NumberedListStyle1">
            //        <li>text</li>
            //        <li>text</li>
            //     </ol>
            // <div>
            // result:
            // 1. a
            // 2. b
            // 3. c
            it('should process html properly, if there are multiple list item in ol (word online has one list item in each ol for ordered list)', () => {
                runTest(
                    '<html><body><div class="ListContainerWrapper BCX0 SCXW225173058"><ol class="NumberListStyle1"><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">A</li><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">B</li></ol></div><div class="ListContainerWrapper BCX0 SCXW225173058"><ol><li role="listitem" data-aria-level="1" style="margin: 0px 0px 0px 24px;">C</li></ol></div></body></html>',
                    true,
                    '<ol><li role="listitem" data-aria-level="1">A</li><li role="listitem" data-aria-level="1">B</li><li role="listitem" data-aria-level="1">C</li></ol>'
                );
            });
        });
    });
});
