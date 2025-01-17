import { RenderingTestCase, moduleFor, runTask } from 'internal-test-helpers';
import { Component } from '@ember/-internals/glimmer';
import { set } from '@ember/-internals/metal';
import { action } from '@ember/object';

moduleFor(
  'Helpers test: default helper manager',
  class extends RenderingTestCase {
    '@feature(EMBER_DEFAULT_HELPER_MANAGER) plain functions can be used as helpers'() {
      function hello() {
        return 'hello';
      }

      this.render('{{(this.hello)}}', {
        hello,
      });
      this.assertText('hello');

      runTask(() => this.rerender());
      this.assertText('hello');
    }

    '@feature(EMBER_DEFAULT_HELPER_MANAGER) positional arguments are passed as function arguments'(
      assert
    ) {
      function hello(...args) {
        assert.deepEqual(args, [1, 2, 3]);
        return args.length;
      }

      this.render('{{(this.hello 1 2 3)}}', {
        hello,
      });
      this.assertText('3');
    }

    '@feature(EMBER_DEFAULT_HELPER_MANAGER) tracks changes to positional arguments'(assert) {
      let count = 0;

      function hello(firstArgument) {
        count++;
        return firstArgument;
      }

      this.render('{{(this.hello this.foo)}}', {
        hello,
        foo: 123,
      });

      assert.strictEqual(count, 1, 'rendered once');
      this.assertText('123');

      runTask(() => this.rerender());
      assert.equal(count, 1, 'rendered once');
      this.assertText('123');

      runTask(() => set(this.context, 'foo', 456));

      assert.equal(count, 2, 'rendered twice');
      this.assertText('456');
    }

    '@feature(EMBER_DEFAULT_HELPER_MANAGER) named arguments are passed as the last function argument'(
      assert
    ) {
      function hello(positional, named) {
        assert.strictEqual(positional, 'foo');

        return named.foo;
      }

      this.render('{{(this.hello "foo" foo="bar")}}', {
        hello,
      });
      this.assertText('bar');
    }

    '@feature(EMBER_DEFAULT_HELPER_MANAGER) tracks changes to named arguments'(assert) {
      let count = 0;

      function hello(named) {
        count++;
        return named.foo;
      }

      this.render('{{(this.hello foo=this.foo)}}', {
        hello,
        foo: 123,
      });

      assert.strictEqual(count, 1, 'rendered once');
      this.assertText('123');

      runTask(() => this.rerender());
      assert.equal(count, 1, 'rendered once');
      this.assertText('123');

      runTask(() => set(this.context, 'foo', 456));

      assert.equal(count, 2, 'rendered twice');
      this.assertText('456');
    }

    '@feature(EMBER_DEFAULT_HELPER_MANAGER) plain functions passed as component arguments can be used as helpers'() {
      function hello() {
        return 'hello';
      }

      this.registerComponent('foo-bar', { template: '{{(@hello)}}' });

      this.render(`<FooBar @hello={{this.hello}} />`, {
        hello,
      });
      this.assertText('hello');
    }

    '@feature(EMBER_DEFAULT_HELPER_MANAGER) plain functions stored as class properties can be used as helpers'() {
      this.registerComponent('foo-bar', {
        template: '{{(this.hello)}}',
        ComponentClass: class extends Component {
          hello = () => {
            return 'hello';
          };
        },
      });

      this.render(`<FooBar />`);
      this.assertText('hello');
    }

    '@feature(EMBER_DEFAULT_HELPER_MANAGER) class methods can be used as helpers'() {
      this.registerComponent('foo-bar', {
        template: '{{(this.hello)}}',
        ComponentClass: class extends Component {
          hello() {
            return 'hello';
          }
        },
      });

      this.render(`<FooBar />`);
      this.assertText('hello');
    }

    '@feature(EMBER_DEFAULT_HELPER_MANAGER) actions can be used as helpers'() {
      this.registerComponent('foo-bar', {
        template: '{{(this.hello)}}',
        ComponentClass: class extends Component {
          someProperty = 'hello';

          @action
          hello() {
            return this.someProperty;
          }
        },
      });

      this.render(`<FooBar />`);
      this.assertText('hello');
    }
  }
);
