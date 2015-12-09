import React from 'react';
import chai, {expect} from 'chai';

chai.use(require('../src/chai-react-element'));

describe('ReactElement matcher', function() {

	describe('.text', function() {
		it('asserts innerText', function() {
			expect(
				() => {
					expect(<div>hello</div>).to.have.text('hello')
				}).not.to.throw();
		});
	});

	describe('.prop', function() {
		it('asserts top-level element with prop', function() {
			expect(
				() => {
					expect(<div data-foo="bar"></div>).to.have.prop('data-foo', 'bar');
				}).not.to.throw();
		});

		it('asserts nested element with prop', function() {
			expect(
				() => {
					expect(<div><div data-foo="bar"></div></div>).to.include.prop('data-foo', 'bar');
				}).not.to.throw();

		});

		it('gives a detailed message when prop was not found', function() {
			expect(
				() => {
					expect(<div></div>).to.have.prop('a', 'b');
				}).to.throw(/AssertionError: expected vdom {"type":"div".*} to contain a prop with name 'a' and value b, but got undefined/);
		});

		it('is chainable', function() {
			expect(expect(<div><div data-foo="bar">hello</div></div>).to.include.prop('data-foo', 'bar'))
				.to.be.an.instanceOf(chai.Assertion)
				.and.to.have.property('_obj').that.has.text('hello')
		});
	});

	describe('.elementWithType', function() {
		it('asserts top-level element', function() {
			expect(
				() => {
					expect(<div></div>).to.have.elementOfType('div')
				}).not.to.throw();
		});

		it('asserts nested element with tag', function() {
			expect(
				() => {
					expect(<div><span></span></div>).to.include.elementOfType('span');
				}).not.to.throw();

		});

		it('gives a detailed message when element was not found', function() {
			expect(
				() => {
					expect(<div></div>).to.have.elementOfType('span')
				}).to.throw(/AssertionError: expected vdom {"type":"div".*} to have an element of type 'span', but got div/);
		});

		it('is chainable', function() {
			expect(expect(<div><span>hello</span></div>).to.include.elementOfType('span'))
				.to.be.an.instanceOf(chai.Assertion)
				.and.to.have.property('_obj').that.has.text('hello')
		});
	})
});
