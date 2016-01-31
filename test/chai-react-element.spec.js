import 'source-map-support/register';
import React from 'react';
import chai, {expect} from 'chai';
import matcher from '../src/chai-react-element';
import canBeAsserted from '../src/can-be-asserted';
import {isInBrowser, ReactClientRenderer} from './react-client-renderer';
chai.use(matcher);

// this asserts that we have no false positives, see https://github.com/chaijs/chai/issues/467
// can be removed when upgrading to Chai 4.x.x
chai.use(function(chai) {
	chai.Assertion.overwriteMethod('prop', explode);
	chai.Assertion.overwriteMethod('text', explode);
	chai.Assertion.overwriteMethod('elementOfType', explode);

	function explode(_super) {
		return function() {
			if (typeof this._obj === 'string' || canBeAsserted(this._obj)) {
				return _super.apply(this, arguments);
			} else {
				throw new Error(`No plugin found for asserting expectable ${this._obj}`);
			}
		}
	}
});

describe('ReactElement matcher', function() {

	if (isInBrowser()) {
		const renderer = new ReactClientRenderer();
		before(renderer.mount.bind(renderer));
		beforeEach(renderer.cleanup.bind(renderer));
		after(renderer.destroy.bind(renderer));

		describe('for rendered DOM', assertContract(renderer.render.bind(renderer)));
	}

	describe('for React VDOM', assertContract(vdom => vdom));

	function assertContract(render) {
		return function() {

			it('should filter nulls', function() {
				expect(render(<div>{null} <span>yo</span></div>)).to.include.elementOfType('span');
			});

			describe('.text', function () {
				it('asserts innerText', function () {
					expect(
						() => {
							expect(render(<div>hello</div>)).to.have.text('hello')
						}).not.to.throw();

					expect(
						() => {
							expect(render(<div>hello</div>)).to.have.text('world')
						}).to.throw(/AssertionError: expected <.*> to have text 'world'/);
				});

				it('supports negation', function () {
					expect(
						() => {
							expect(render(<div>hello</div>)).to.not.have.text('hello')
						}).to.throw();

					expect(
						() => {
							expect(render(<div>hello</div>)).to.not.have.text('world')
						}).not.to.throw();
				});

				it('detects text in children array', function () {
					expect(
						() => {
							expect({type: 'div', props: {children: ['bar']}}).to.have.text('bar')
						}).not.to.throw();
				});

				it('filters nulls', function() {
					expect(
						() => {
							expect(render(<div>{null} <span>yo</span></div>)).to.include.text('yo')
					}).not.to.throw();
				});
			});

			describe('.prop', function () {
				it('asserts top-level element with prop', function () {
					expect(
						() => {
							expect(render(<div data-foo="bar"></div>)).to.have.prop('data-foo', 'bar');
						}).not.to.throw();
				});

				it('asserts boolean prop', function () {
					expect(
						() => {
							expect(render(<div disabled></div>)).to.have.prop('disabled');
						}).not.to.throw();
				});

				it('asserts boolean prop with false value', function () {
					expect(
						() => {
							expect(render(<div disabled={false}></div>)).to.have.prop('disabled', false);
						}).not.to.throw();
				});

				it('asserts nested element with prop', function () {
					expect(
						() => {
							expect(render(<div>
								<div data-foo="bar"></div>
							</div>)).to.include.prop('data-foo', 'bar');
						}).not.to.throw();

				});

				it('asserts nested element with prop in non compacted array', function () {
					expect(
						() => {
							expect(render(<div>{[null, [<div
								data-foo="bar"></div>]]}</div>)).to.include.prop('data-foo', 'bar');
						}).not.to.throw();

				});

				it('gives a detailed message when prop was not found', function () {
					expect(
						() => {
							expect(render(<div></div>)).to.have.prop('a', 'b');
						}).to.throw(/AssertionError: expected <.*> to contain a prop with name 'a' and value b/);
				});

				it('is chainable', function () {
					expect(expect(render(<div>
						<div data-foo="bar">hello</div>
					</div>)).to.include.prop('data-foo', 'bar'))
						.to.be.an.instanceOf(chai.Assertion)
						.and.to.have.property('_obj').that.has.text('hello')
				});

				it('handles undefined props gracefully', function () {
					expect(
						() => {
							expect(render(<div data-foo={undefined}/>)).to.include.prop('data-foo', undefined);
						}).not.to.throw();
				});
			});

			describe('.elementWithType', function () {
				it('asserts top-level element', function () {
					expect(
						() => {
							expect(render(<div></div>)).to.have.elementOfType('div')
						}).not.to.throw();
				});

				it('asserts nested element with tag', function () {
					expect(
						() => {
							expect(render(<div><span></span></div>)).to.include.elementOfType('span');
						}).not.to.throw();

				});

				it('gives a detailed message when element was not found', function () {
					expect(
						() => {
							expect(render(<div></div>)).to.have.elementOfType('span')
						}).to.throw(/AssertionError: expected <.*> to have an element of type 'span'/);
				});

				it('is chainable', function () {
					expect(expect(render(<div><span>hello</span></div>)).to.include.elementOfType('span'))
						.to.be.an.instanceOf(chai.Assertion)
						.and.to.have.property('_obj').that.has.text('hello')
				});

				it('handles negation properly', function () {
					expect(
						() => {
							expect(render(<div></div>)).not.to.have.elementOfType('div')
						}).to.throw(/AssertionError: expected <.*> not to have an element of type 'div'/);

					expect(
						() => {
							expect(render(<div><span></span></div>)).not.to.include.elementOfType('span')
						}).to.throw(/AssertionError: expected <.*> not to have an element of type 'span'/);
				});

				it('filters nulls', function() {
					expect(
						() => {
							expect(render(<div>{null} <span>yo</span></div>)).to.include.an.elementOfType('span')
						}).not.to.throw();
				});
			});

			describe('nesting behavior', function () {
				it('retains all matching elements for a chained assertion so as to satisfy nested assertions', function () {
					expect(
						() => {
							expect(render(<div><span></span><span data-foo="bar"></span>
							</div>)).to.include.elementOfType('span').with.prop('data-foo', 'bar');
						}).not.to.throw();
				});

				it('fails when a nested assertion fails', function () {
					expect(
						() => {
							expect(render(<div><span></span><span></span>
							</div>)).to.include.elementOfType('span').with.prop('data-foo');
						}).to.throw(/AssertionError: expected <.*> to contain a prop with name 'data-foo'/);
				});

				// need to think about nested negation
				xit('handles negation properly', function () {
					expect(
						() => {
							expect(render(<div><span></span><span data-foo="bar"></span>
							</div>)).to.not.include.elementOfType('span').with.prop('data-foo');
						}).not.to.throw();
				});
			});
		}
	}
});
